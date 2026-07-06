-- Extensions ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1) reservations table --------------------------------------------------
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  public_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  reservation_number TEXT UNIQUE,
  inventory_unit_id UUID NOT NULL REFERENCES public.inventory_units(id) ON DELETE RESTRICT,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  product_price NUMERIC(12,2) NOT NULL,
  reservation_amount NUMERIC(12,2) NOT NULL,
  balance_due NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
  hold_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  reservation_expires_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  converted_bill_id UUID REFERENCES public.bills(id) ON DELETE SET NULL,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  refund_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  refund_id TEXT,
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reservations_status_check CHECK (status IN (
    'PENDING_PAYMENT','CONFIRMED','EXPIRED','CANCELLED','CONVERTED','REFUNDED_PARTIAL','CONFIRMED_ORPHANED'
  ))
);

CREATE UNIQUE INDEX reservations_active_unit_unique
  ON public.reservations(inventory_unit_id)
  WHERE status IN ('PENDING_PAYMENT','CONFIRMED');

CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_hold_expires ON public.reservations(hold_expires_at)
  WHERE status = 'PENDING_PAYMENT';
CREATE INDEX idx_reservations_expires ON public.reservations(reservation_expires_at)
  WHERE status = 'CONFIRMED';
CREATE INDEX idx_reservations_phone ON public.reservations(customer_phone);

GRANT SELECT, INSERT, UPDATE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage reservations" ON public.reservations
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2) reservation_events audit log ---------------------------------------
CREATE TABLE public.reservation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  prev_status TEXT,
  new_status TEXT,
  actor TEXT NOT NULL DEFAULT 'system',
  payload_hash TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX reservation_events_payload_hash_unique
  ON public.reservation_events(payload_hash)
  WHERE payload_hash IS NOT NULL;

CREATE INDEX idx_reservation_events_reservation
  ON public.reservation_events(reservation_id, created_at DESC);

GRANT SELECT, INSERT ON public.reservation_events TO authenticated;
GRANT ALL ON public.reservation_events TO service_role;

ALTER TABLE public.reservation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read reservation events" ON public.reservation_events
  FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

-- 3) bills additions ----------------------------------------------------
ALTER TABLE public.bills
  ADD COLUMN IF NOT EXISTS advance_paid NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bills_reservation ON public.bills(reservation_id) WHERE reservation_id IS NOT NULL;

-- 4) reservation amount tier -------------------------------------------
CREATE OR REPLACE FUNCTION public.calc_reservation_amount(_price NUMERIC)
RETURNS NUMERIC LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE
    WHEN _price <= 10000 THEN 2000
    WHEN _price <= 30000 THEN 3000
    ELSE 5000
  END::numeric;
$$;

-- 5) atomic hold creation ----------------------------------------------
CREATE OR REPLACE FUNCTION public.create_reservation_hold(
  _inventory_unit_id UUID,
  _customer_name TEXT,
  _customer_phone TEXT,
  _customer_email TEXT,
  _ip TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS public.reservations
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_product_id UUID;
  v_price NUMERIC;
  v_status TEXT;
  v_amount NUMERIC;
  v_res public.reservations;
  v_number TEXT;
  v_active_count INT;
BEGIN
  IF _customer_name IS NULL OR length(btrim(_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Customer name is required' USING ERRCODE = 'check_violation';
  END IF;
  IF _customer_phone IS NULL OR _customer_phone !~ '^[+0-9][0-9 -]{7,20}$' THEN
    RAISE EXCEPTION 'Valid customer phone is required' USING ERRCODE = 'check_violation';
  END IF;

  SELECT count(*) INTO v_active_count
  FROM public.reservations
  WHERE customer_phone = btrim(_customer_phone)
    AND status IN ('PENDING_PAYMENT','CONFIRMED');
  IF v_active_count >= 2 THEN
    RAISE EXCEPTION 'You already have 2 active reservations. Please complete or cancel one before starting another.'
      USING ERRCODE = 'check_violation';
  END IF;

  SELECT product_id, status INTO v_product_id, v_status
  FROM public.inventory_units
  WHERE id = _inventory_unit_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory unit not found' USING ERRCODE = 'no_data_found';
  END IF;
  IF v_status <> 'AVAILABLE' THEN
    RAISE EXCEPTION 'Unit is not available for reservation (status=%)', v_status
      USING ERRCODE = 'unique_violation';
  END IF;

  SELECT selling_price INTO v_price FROM public.products WHERE id = v_product_id;
  IF v_price IS NULL OR v_price <= 0 THEN
    RAISE EXCEPTION 'Product price unavailable' USING ERRCODE = 'check_violation';
  END IF;

  v_amount := public.calc_reservation_amount(v_price);
  v_number := 'RSV-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 6));

  INSERT INTO public.reservations (
    reservation_number, inventory_unit_id, product_id,
    customer_name, customer_phone, customer_email,
    product_price, reservation_amount, balance_due,
    ip_address, user_agent
  ) VALUES (
    v_number, _inventory_unit_id, v_product_id,
    btrim(_customer_name), btrim(_customer_phone), NULLIF(btrim(_customer_email), ''),
    v_price, v_amount, v_price - v_amount,
    _ip, _user_agent
  )
  RETURNING * INTO v_res;

  UPDATE public.inventory_units
    SET status = 'RESERVATION_PENDING', updated_at = now()
    WHERE id = _inventory_unit_id;

  INSERT INTO public.reservation_events (reservation_id, event_type, new_status, actor)
    VALUES (v_res.id, 'HOLD_STARTED', 'PENDING_PAYMENT', 'customer');

  RETURN v_res;
END;
$$;

-- 6) attach razorpay order id after order creation ---------------------
CREATE OR REPLACE FUNCTION public.attach_razorpay_order(
  _reservation_id UUID,
  _razorpay_order_id TEXT
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.reservations
    SET razorpay_order_id = _razorpay_order_id
    WHERE id = _reservation_id AND razorpay_order_id IS NULL;
END; $$;

-- 7) idempotent confirmation -------------------------------------------
CREATE OR REPLACE FUNCTION public.confirm_reservation(
  _reservation_id UUID,
  _razorpay_order_id TEXT,
  _razorpay_payment_id TEXT,
  _razorpay_signature TEXT
) RETURNS public.reservations
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_res public.reservations;
  v_unit_status TEXT;
  v_prev TEXT;
BEGIN
  SELECT * INTO v_res FROM public.reservations WHERE id = _reservation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reservation not found'; END IF;

  IF v_res.status = 'CONFIRMED' THEN
    RETURN v_res;                 -- idempotent no-op
  END IF;

  v_prev := v_res.status;

  IF v_res.status IN ('EXPIRED','CANCELLED') THEN
    SELECT status INTO v_unit_status
      FROM public.inventory_units
      WHERE id = v_res.inventory_unit_id FOR UPDATE;

    IF v_unit_status = 'AVAILABLE' THEN
      UPDATE public.reservations SET
        status='CONFIRMED', confirmed_at=now(),
        reservation_expires_at = now() + interval '7 days',
        razorpay_order_id = _razorpay_order_id,
        razorpay_payment_id = _razorpay_payment_id,
        razorpay_signature = _razorpay_signature
      WHERE id = _reservation_id RETURNING * INTO v_res;
      UPDATE public.inventory_units SET status='RESERVED', updated_at=now()
        WHERE id = v_res.inventory_unit_id;
      INSERT INTO public.reservation_events (reservation_id, event_type, prev_status, new_status, actor, payload)
        VALUES (_reservation_id, 'CONFIRMED', v_prev, 'CONFIRMED', 'system',
                jsonb_build_object('note','reclaimed_after_expiry'));
    ELSE
      UPDATE public.reservations SET
        status='CONFIRMED_ORPHANED',
        razorpay_order_id = _razorpay_order_id,
        razorpay_payment_id = _razorpay_payment_id,
        razorpay_signature = _razorpay_signature
      WHERE id = _reservation_id RETURNING * INTO v_res;
      INSERT INTO public.reservation_events (reservation_id, event_type, prev_status, new_status, actor, payload)
        VALUES (_reservation_id, 'ORPHANED', v_prev, 'CONFIRMED_ORPHANED', 'system',
                jsonb_build_object('unit_status', v_unit_status, 'reason','unit_unavailable_after_payment'));
    END IF;
    RETURN v_res;
  END IF;

  IF v_res.status <> 'PENDING_PAYMENT' THEN
    RAISE EXCEPTION 'Cannot confirm reservation in status %', v_res.status;
  END IF;

  UPDATE public.reservations SET
    status='CONFIRMED', confirmed_at=now(),
    reservation_expires_at = now() + interval '7 days',
    razorpay_order_id = _razorpay_order_id,
    razorpay_payment_id = _razorpay_payment_id,
    razorpay_signature = _razorpay_signature
  WHERE id = _reservation_id RETURNING * INTO v_res;

  UPDATE public.inventory_units SET status='RESERVED', updated_at=now()
    WHERE id = v_res.inventory_unit_id;

  INSERT INTO public.reservation_events (reservation_id, event_type, prev_status, new_status, actor)
    VALUES (_reservation_id, 'CONFIRMED', 'PENDING_PAYMENT', 'CONFIRMED', 'system');

  RETURN v_res;
END; $$;

-- 8) sweeper -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.expire_stale_reservations()
RETURNS TABLE(expired_pending INT, expired_confirmed INT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_pending INT := 0;
  v_confirmed INT := 0;
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, inventory_unit_id FROM public.reservations
    WHERE status='PENDING_PAYMENT' AND hold_expires_at < now()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.reservations SET status='EXPIRED' WHERE id=r.id;
    UPDATE public.inventory_units SET status='AVAILABLE', updated_at=now()
      WHERE id=r.inventory_unit_id AND status='RESERVATION_PENDING';
    INSERT INTO public.reservation_events (reservation_id, event_type, prev_status, new_status, actor)
      VALUES (r.id,'EXPIRED','PENDING_PAYMENT','EXPIRED','system');
    v_pending := v_pending + 1;
  END LOOP;

  FOR r IN
    SELECT id, inventory_unit_id FROM public.reservations
    WHERE status='CONFIRMED' AND reservation_expires_at < now()
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE public.reservations SET status='EXPIRED' WHERE id=r.id;
    UPDATE public.inventory_units SET status='AVAILABLE', updated_at=now()
      WHERE id=r.inventory_unit_id AND status='RESERVED';
    INSERT INTO public.reservation_events (reservation_id, event_type, prev_status, new_status, actor, payload)
      VALUES (r.id,'EXPIRED','CONFIRMED','EXPIRED','system',jsonb_build_object('reason','7_day_window'));
    v_confirmed := v_confirmed + 1;
  END LOOP;

  RETURN QUERY SELECT v_pending, v_confirmed;
END; $$;

-- 9) refund eligibility ------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_refund_eligibility(_reservation_id UUID)
RETURNS TABLE(eligible BOOLEAN, percent INT, amount NUMERIC, reason TEXT)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_res public.reservations;
  v_hours NUMERIC;
BEGIN
  SELECT * INTO v_res FROM public.reservations WHERE id=_reservation_id;
  IF NOT FOUND THEN RETURN QUERY SELECT false,0,0::numeric,'not_found'; RETURN; END IF;
  IF v_res.status = 'PENDING_PAYMENT' THEN
    RETURN QUERY SELECT true, 100, v_res.reservation_amount, 'pending_full_refund'; RETURN;
  END IF;
  IF v_res.status <> 'CONFIRMED' THEN
    RETURN QUERY SELECT false,0,0::numeric,'not_confirmed'; RETURN;
  END IF;
  v_hours := EXTRACT(EPOCH FROM (now() - v_res.confirmed_at))/3600;
  IF v_hours <= 24 THEN
    RETURN QUERY SELECT true, 50, round(v_res.reservation_amount*0.5,2), 'within_24h'; RETURN;
  END IF;
  RETURN QUERY SELECT false,0,0::numeric,'past_24h';
END; $$;

-- 10) record cancellation/refund outcome ------------------------------
CREATE OR REPLACE FUNCTION public.record_reservation_cancellation(
  _reservation_id UUID,
  _refund_amount NUMERIC,
  _refund_id TEXT,
  _reason TEXT,
  _actor TEXT DEFAULT 'system'
) RETURNS public.reservations
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_res public.reservations;
  v_new_status TEXT;
  v_prev TEXT;
BEGIN
  SELECT * INTO v_res FROM public.reservations WHERE id=_reservation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reservation not found'; END IF;
  IF v_res.status NOT IN ('CONFIRMED','PENDING_PAYMENT','CONFIRMED_ORPHANED') THEN
    RAISE EXCEPTION 'Cannot cancel reservation in status %', v_res.status;
  END IF;
  v_prev := v_res.status;
  v_new_status := CASE WHEN _refund_amount > 0 THEN 'REFUNDED_PARTIAL' ELSE 'CANCELLED' END;

  UPDATE public.reservations SET
    status = v_new_status,
    cancelled_at = now(),
    refunded_at = CASE WHEN _refund_amount > 0 THEN now() ELSE NULL END,
    refund_amount = _refund_amount,
    refund_id = _refund_id,
    refund_reason = _reason
  WHERE id = _reservation_id RETURNING * INTO v_res;

  UPDATE public.inventory_units SET status='AVAILABLE', updated_at=now()
    WHERE id = v_res.inventory_unit_id AND status IN ('RESERVATION_PENDING','RESERVED');

  INSERT INTO public.reservation_events (reservation_id, event_type, prev_status, new_status, actor, payload)
    VALUES (_reservation_id,
            CASE WHEN _refund_amount>0 THEN 'REFUNDED' ELSE 'CANCELLED' END,
            v_prev, v_new_status, _actor,
            jsonb_build_object('refund_amount',_refund_amount,'refund_id',_refund_id,'reason',_reason));

  RETURN v_res;
END; $$;

-- 11) convert reservation → bill (staff only) --------------------------
CREATE OR REPLACE FUNCTION public.convert_reservation_to_sale(
  _reservation_id UUID,
  _payment_method TEXT,
  _discount NUMERIC DEFAULT 0,
  _tax NUMERIC DEFAULT 0
) RETURNS public.bills
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_res public.reservations;
  v_bill public.bills;
  v_bill_number TEXT;
  v_grand NUMERIC;
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT public.is_staff(v_uid) THEN
    RAISE EXCEPTION 'Only staff can convert reservations';
  END IF;

  SELECT * INTO v_res FROM public.reservations WHERE id=_reservation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reservation not found'; END IF;
  IF v_res.status <> 'CONFIRMED' THEN
    RAISE EXCEPTION 'Only CONFIRMED reservations can be converted (status=%)', v_res.status;
  END IF;

  v_bill_number := 'INV-' || to_char(now(),'YYMMDD') || '-' || upper(substr(encode(gen_random_bytes(3),'hex'),1,6));
  v_grand := v_res.product_price - COALESCE(_discount,0) + COALESCE(_tax,0);

  -- release unit briefly so the duplicate-sale trigger accepts the insert
  UPDATE public.inventory_units SET status='AVAILABLE', updated_at=now()
    WHERE id = v_res.inventory_unit_id;

  INSERT INTO public.bills (
    bill_number, customer_name, customer_phone,
    subtotal, discount, tax, grand_total,
    payment_method, status, created_by,
    advance_paid, reservation_id
  ) VALUES (
    v_bill_number, v_res.customer_name, v_res.customer_phone,
    v_res.product_price, COALESCE(_discount,0), COALESCE(_tax,0), v_grand,
    _payment_method, 'COMPLETED', v_uid,
    v_res.reservation_amount, v_res.id
  ) RETURNING * INTO v_bill;

  INSERT INTO public.bill_items (bill_id, inventory_unit_id, product_id, description, unit_price, quantity, line_total)
    VALUES (v_bill.id, v_res.inventory_unit_id, v_res.product_id, NULL,
            v_res.product_price, 1, v_res.product_price);

  UPDATE public.inventory_units SET status='SOLD', sold_at=now(), updated_at=now()
    WHERE id = v_res.inventory_unit_id;

  UPDATE public.reservations
    SET status='CONVERTED', converted_at=now(), converted_bill_id=v_bill.id
    WHERE id = _reservation_id;

  INSERT INTO public.reservation_events (reservation_id, event_type, prev_status, new_status, actor, payload)
    VALUES (_reservation_id, 'CONVERTED', 'CONFIRMED', 'CONVERTED', 'staff:'||v_uid::text,
            jsonb_build_object('bill_id', v_bill.id, 'bill_number', v_bill.bill_number));

  RETURN v_bill;
END; $$;

-- 12) block direct POS on units with a payment in progress ------------
CREATE OR REPLACE FUNCTION public.prevent_duplicate_unit_sale()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_existing uuid;
  v_status text;
BEGIN
  IF NEW.inventory_unit_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT bi.bill_id INTO v_existing
  FROM public.bill_items bi
  WHERE bi.inventory_unit_id = NEW.inventory_unit_id
    AND (TG_OP = 'INSERT' OR bi.id <> NEW.id)
    AND bi.bill_id <> NEW.bill_id
  LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION 'Inventory unit % is already sold on another bill (%).', NEW.inventory_unit_id, v_existing
      USING ERRCODE = 'unique_violation';
  END IF;

  SELECT status INTO v_status FROM public.inventory_units WHERE id = NEW.inventory_unit_id;
  IF v_status = 'RESERVATION_PENDING' THEN
    RAISE EXCEPTION 'Inventory unit % has an active reservation payment in progress. Wait for it to expire or cancel it.', NEW.inventory_unit_id
      USING ERRCODE = 'unique_violation';
  END IF;

  RETURN NEW;
END; $$;

-- 13) cron: expire holds every minute ---------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'reservation-sweeper') THEN
    PERFORM cron.unschedule('reservation-sweeper');
  END IF;
  PERFORM cron.schedule(
    'reservation-sweeper',
    '* * * * *',
    $cron$SELECT public.expire_stale_reservations();$cron$
  );
END $$;
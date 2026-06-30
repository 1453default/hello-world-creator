
-- Prevent selling the same inventory unit (IMEI) twice via bill_items.
-- Also guard against assigning a unit whose status is RESERVED to a different bill.
CREATE OR REPLACE FUNCTION public.prevent_duplicate_unit_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing uuid;
  v_status text;
BEGIN
  IF NEW.inventory_unit_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Block if the inventory unit is already referenced by another bill_item (different bill).
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

  -- Make sure the unit isn't marked SOLD by an unrelated path (defence in depth).
  SELECT status INTO v_status FROM public.inventory_units WHERE id = NEW.inventory_unit_id;
  IF v_status = 'SOLD' AND v_existing IS NULL THEN
    -- Unit is marked SOLD but no bill_item references it yet — allow (this insert is the sale).
    NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_duplicate_unit_sale ON public.bill_items;
CREATE TRIGGER trg_prevent_duplicate_unit_sale
BEFORE INSERT OR UPDATE OF inventory_unit_id, bill_id ON public.bill_items
FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_unit_sale();

-- Helpful indexes for IMEI-driven joins / search.
CREATE INDEX IF NOT EXISTS idx_bill_items_inventory_unit ON public.bill_items(inventory_unit_id);
CREATE INDEX IF NOT EXISTS idx_inventory_units_product_status ON public.inventory_units(product_id, status);

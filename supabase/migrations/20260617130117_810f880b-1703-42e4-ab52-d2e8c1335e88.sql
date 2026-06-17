
-- Auto-unlist sold products once threshold reached and no AVAILABLE units remain
CREATE OR REPLACE FUNCTION public.auto_unlist_sold_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_threshold int := 5;
  v_setting text;
  v_sold int;
  v_available int;
  v_product uuid;
BEGIN
  v_product := COALESCE(NEW.product_id, OLD.product_id);
  IF v_product IS NULL THEN RETURN NEW; END IF;

  SELECT value INTO v_setting FROM public.shop_settings WHERE key = 'auto_unlist_sold_threshold';
  IF v_setting IS NOT NULL AND v_setting ~ '^\d+$' THEN
    v_threshold := GREATEST(1, v_setting::int);
  END IF;

  SELECT
    COUNT(*) FILTER (WHERE status = 'SOLD'),
    COUNT(*) FILTER (WHERE status = 'AVAILABLE')
  INTO v_sold, v_available
  FROM public.inventory_units
  WHERE product_id = v_product;

  IF v_sold >= v_threshold AND v_available = 0 THEN
    UPDATE public.products SET is_listed = false WHERE id = v_product AND is_listed = true;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_unlist_sold ON public.inventory_units;
CREATE TRIGGER trg_auto_unlist_sold
AFTER INSERT OR UPDATE OF status ON public.inventory_units
FOR EACH ROW EXECUTE FUNCTION public.auto_unlist_sold_product();

-- Seed default threshold if missing
INSERT INTO public.shop_settings (key, value)
VALUES ('auto_unlist_sold_threshold', '5')
ON CONFLICT (key) DO NOTHING;

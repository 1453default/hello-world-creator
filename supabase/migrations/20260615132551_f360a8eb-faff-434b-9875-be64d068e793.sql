-- Remove the overly permissive public SELECT on inventory_units
DROP POLICY IF EXISTS "Public read available units count" ON public.inventory_units;

-- Public-safe aggregate: only available counts per product, no IMEI/cost
CREATE OR REPLACE VIEW public.product_available_counts AS
  SELECT product_id, COUNT(*)::int AS available_count
  FROM public.inventory_units
  WHERE status = 'AVAILABLE'
  GROUP BY product_id;

GRANT SELECT ON public.product_available_counts TO anon, authenticated;
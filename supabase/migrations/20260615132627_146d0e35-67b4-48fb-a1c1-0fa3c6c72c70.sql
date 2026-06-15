-- Switch view to security_invoker so it respects caller RLS / column grants
DROP VIEW IF EXISTS public.product_available_counts;
CREATE VIEW public.product_available_counts
  WITH (security_invoker = on) AS
  SELECT product_id, COUNT(*)::int AS available_count
  FROM public.inventory_units
  WHERE status = 'AVAILABLE'
  GROUP BY product_id;

GRANT SELECT ON public.product_available_counts TO anon, authenticated;

-- Allow anon to read only available units, and only safe columns
CREATE POLICY "Anon read available units"
  ON public.inventory_units
  FOR SELECT
  TO anon
  USING (status = 'AVAILABLE');

REVOKE SELECT ON public.inventory_units FROM anon;
GRANT SELECT (id, product_id, status) ON public.inventory_units TO anon;
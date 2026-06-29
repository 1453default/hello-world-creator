
-- Allow anon to read recently-sold inventory units (for Recently Sold homepage section)
GRANT SELECT ON public.inventory_units TO anon;

CREATE POLICY "Anon read recently sold units"
ON public.inventory_units
FOR SELECT
TO anon
USING (status = 'SOLD' AND sold_at >= now() - interval '30 days');

-- Allow anon to read products that have a recently-sold unit, even if auto-unlisted
DROP POLICY IF EXISTS "Public read listed products" ON public.products;
CREATE POLICY "Public read listed products"
ON public.products
FOR SELECT
TO public
USING (
  (is_listed AND NOT is_deleted)
  OR is_staff(auth.uid())
  OR (
    NOT is_deleted
    AND EXISTS (
      SELECT 1 FROM public.inventory_units iu
      WHERE iu.product_id = products.id
        AND iu.status = 'SOLD'
        AND iu.sold_at >= now() - interval '30 days'
    )
  )
);

-- Fix #1: inventory_units IMEI/serial/cost/notes/supplier were readable by anon.
-- RLS is row-level; combine it with column-level privileges so PostgREST
-- refuses to project sensitive columns even under the existing anon SELECT
-- policies (needed for public product cards to show available/sold counts).
REVOKE SELECT ON public.inventory_units FROM anon;
GRANT SELECT (id, product_id, status, sold_at) ON public.inventory_units TO anon;

-- Fix #2: Drop the over-broad storage policies that let any signed-in user
-- write/delete product images. The stricter Staff-only policies remain.
DROP POLICY IF EXISTS "Authed upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authed update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authed delete product-images" ON storage.objects;

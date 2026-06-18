-- Allow anon and authenticated to read product-images storage objects.
-- This enables createSignedUrl() from the browser (works on Vercel, Netlify, Lovable — no SSR proxy needed).
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authed upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authed update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Authed delete product-images" ON storage.objects;

CREATE POLICY "Public read product-images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authed upload product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authed update product-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Authed delete product-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
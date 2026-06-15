
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
  USING (bucket_id IN ('product-images','brand-logos'));
CREATE POLICY "auth_write_product_images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('product-images','brand-logos'));
CREATE POLICY "auth_update_product_images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('product-images','brand-logos'));
CREATE POLICY "auth_delete_product_images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('product-images','brand-logos'));

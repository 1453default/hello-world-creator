ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS original_url text,
  ADD COLUMN IF NOT EXISTS process_status text,
  ADD COLUMN IF NOT EXISTS processed_at timestamptz,
  ADD COLUMN IF NOT EXISTS process_error text;

CREATE INDEX IF NOT EXISTS product_images_process_status_idx
  ON public.product_images (process_status);
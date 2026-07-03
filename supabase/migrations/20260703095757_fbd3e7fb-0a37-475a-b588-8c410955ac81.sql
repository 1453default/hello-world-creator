ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS original_url text,
  ADD COLUMN IF NOT EXISTS white_bg_url text,
  ADD COLUMN IF NOT EXISTS white_bg_status text,
  ADD COLUMN IF NOT EXISTS white_bg_error text,
  ADD COLUMN IF NOT EXISTS white_bg_processed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_product_images_wb_status
  ON public.product_images (white_bg_status);
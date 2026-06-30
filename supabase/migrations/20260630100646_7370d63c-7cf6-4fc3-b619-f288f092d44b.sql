ALTER TABLE public.inventory_units ADD COLUMN IF NOT EXISTS imei2 text;

CREATE UNIQUE INDEX IF NOT EXISTS inventory_units_imei2_unique
  ON public.inventory_units (imei2)
  WHERE imei2 IS NOT NULL AND length(btrim(imei2)) > 0;

ALTER TABLE public.inventory_units
  DROP CONSTRAINT IF EXISTS inventory_units_imei_imei2_distinct;
ALTER TABLE public.inventory_units
  ADD CONSTRAINT inventory_units_imei_imei2_distinct
  CHECK (imei2 IS NULL OR imei IS NULL OR btrim(imei) <> btrim(imei2));

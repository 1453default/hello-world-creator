
CREATE TABLE public.promo_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_path text NOT NULL,
  heading text,
  subheading text,
  button_text text,
  button_link text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promo_banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_banners TO authenticated;
GRANT ALL ON public.promo_banners TO service_role;

ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active banners"
ON public.promo_banners FOR SELECT
USING (is_active = true);

CREATE POLICY "Staff can read all banners"
ON public.promo_banners FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert banners"
ON public.promo_banners FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update banners"
ON public.promo_banners FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete banners"
ON public.promo_banners FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE TRIGGER promo_banners_updated_at
BEFORE UPDATE ON public.promo_banners
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "Staff can upload promo banner files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'promo-banners' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can update promo banner files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'promo-banners' AND public.is_staff(auth.uid()))
WITH CHECK (bucket_id = 'promo-banners' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete promo banner files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'promo-banners' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can read promo banner files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'promo-banners' AND public.is_staff(auth.uid()));

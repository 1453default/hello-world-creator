import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PromoBanner = {
  id: string;
  image_path: string;
  heading: string | null;
  subheading: string | null;
  button_text: string | null;
  button_link: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export const BANNER_BUCKET = "promo-banners";

export function bannerImageUrl(path: string) {
  return `/api/public/img/${BANNER_BUCKET}/${path}`;
}

export const activeBannersQuery = queryOptions({
  queryKey: ["promo-banners", "active"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("promo_banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as PromoBanner[];
  },
  staleTime: 60_000,
});

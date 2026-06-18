import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SHOP_PHONE = "090004 64640";
export const SHOP_WHATSAPP = "919000464640";
export const SHOP_WHATSAPP_DISPLAY = "+91 90004 64640";
export const SHOP_MAPS_URL = "https://maps.app.goo.gl/F44EijMUeiuE4ACn7";
export const SHOP_INSTAGRAM = "https://www.instagram.com/thereal_used_mobiles";
export const SHOP_INSTAGRAM_HANDLE = "@thereal_used_mobiles";
export const SHOP_ADDRESS =
  "Hyder Manzil, 7 Tombs Rd, beside Al Ameen Meat Mart, Samata Colony, Toli Chowki, Hyderabad, Telangana 500008";
export const SHOP_HOURS = "All Days of the Week: 10:00 AM - 11:00 PM";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${SHOP_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function formatINR(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (v == null || isNaN(v as number)) return "₹0";
  return "₹" + (v as number).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export const conditionLabel: Record<string, string> = {
  like_new: "Like New",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export const shopSettingsQuery = queryOptions({
  queryKey: ["shop_settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("shop_settings").select("key,value");
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, string>;
  },
  staleTime: 5 * 60_000,
});

export function useShopSettings() {
  return useQuery(shopSettingsQuery);
}

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

/**
 * Professional grading system used across the storefront and admin.
 * Highest → lowest quality. Codes are the DB values; labels are user-facing.
 */
export const CONDITION_GRADES = [
  { value: "a_plus_plus", label: "Grade A++" },
  { value: "a_plus", label: "Grade A+" },
  { value: "a", label: "Grade A" },
  { value: "b", label: "Grade B" },
  { value: "c", label: "Grade C" },
] as const;

export const conditionLabel: Record<string, string> = {
  a_plus_plus: "Grade A++",
  a_plus: "Grade A+",
  a: "Grade A",
  b: "Grade B",
  c: "Grade C",
  // Legacy fallbacks (pre-migration). Map to the closest new grade.
  like_new: "Grade A+",
  good: "Grade A",
  fair: "Grade B",
  poor: "Grade C",
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

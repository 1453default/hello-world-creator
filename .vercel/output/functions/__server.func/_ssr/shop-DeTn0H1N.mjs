import { t as supabase } from "./client-CFqbjQaU.mjs";
import { n as queryOptions } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shop-DeTn0H1N.js
var SHOP_PHONE = "090004 64640";
var SHOP_WHATSAPP = "919000464640";
var SHOP_WHATSAPP_DISPLAY = "+91 90004 64640";
var SHOP_MAPS_URL = "https://maps.app.goo.gl/VKzkLwhPNbta42Ae9";
var SHOP_INSTAGRAM = "https://www.instagram.com/thereal_used_mobiles";
var SHOP_INSTAGRAM_HANDLE = "@thereal_used_mobiles";
var SHOP_ADDRESS = "Hyder Manzil, 7 Tombs Rd, beside Al Ameen Meat Mart, Samata Colony, Toli Chowki, Hyderabad, Telangana 500008";
var SHOP_HOURS = "Mon–Sat: 10:00 AM – 8:00 PM";
function whatsappLink(message) {
	const base = `https://wa.me/${SHOP_WHATSAPP}`;
	return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
function formatINR(n) {
	const v = typeof n === "string" ? parseFloat(n) : n;
	if (v == null || isNaN(v)) return "₹0";
	return "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
var conditionLabel = {
	like_new: "Like New",
	good: "Good",
	fair: "Fair",
	poor: "Poor"
};
queryOptions({
	queryKey: ["shop_settings"],
	queryFn: async () => {
		const { data, error } = await supabase.from("shop_settings").select("key,value");
		if (error) throw error;
		return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
	},
	staleTime: 5 * 6e4
});
//#endregion
export { SHOP_MAPS_URL as a, conditionLabel as c, SHOP_INSTAGRAM_HANDLE as i, formatINR as l, SHOP_HOURS as n, SHOP_PHONE as o, SHOP_INSTAGRAM as r, SHOP_WHATSAPP_DISPLAY as s, SHOP_ADDRESS as t, whatsappLink as u };

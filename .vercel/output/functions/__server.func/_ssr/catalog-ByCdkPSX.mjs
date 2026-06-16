import { t as supabase } from "./client-CFqbjQaU.mjs";
import { n as queryOptions } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-ByCdkPSX.js
var PRODUCT_SELECT = `
  id, name, slug, storage, ram, color, condition, selling_price, is_featured, created_at,
  brand:brands ( name, slug ),
  images:product_images ( url, is_primary, display_order ),
  inventory:inventory_units ( id, status )
`;
function resolveImageUrl(url) {
	if (!url) return "";
	const m = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/([^?]+)/);
	if (m) return `/api/public/img/${m[1]}/${m[2]}`;
	return url;
}
function shapeProduct(row) {
	const inv = row.inventory ?? [];
	return {
		...row,
		selling_price: Number(row.selling_price),
		images: (row.images ?? []).map((img) => ({
			...img,
			url: resolveImageUrl(img.url)
		})).sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.display_order - b.display_order),
		available_count: inv.filter((u) => u.status === "AVAILABLE").length
	};
}
var brandsQuery = queryOptions({
	queryKey: ["brands"],
	queryFn: async () => {
		const { data, error } = await supabase.from("brands").select("id,name,slug,logo_url,is_featured,display_order").eq("is_visible", true).order("display_order");
		if (error) throw error;
		return data;
	},
	staleTime: 6e4
});
var allProductsQuery = queryOptions({
	queryKey: ["products", "all"],
	queryFn: async () => {
		const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("is_listed", true).eq("is_deleted", false).order("created_at", { ascending: false });
		if (error) throw error;
		return (data ?? []).map(shapeProduct);
	},
	staleTime: 3e4
});
var productBySlugQuery = (slug) => queryOptions({
	queryKey: ["product", slug],
	queryFn: async () => {
		const { data, error } = await supabase.from("products").select(PRODUCT_SELECT + ", description, model, category").eq("slug", slug).eq("is_listed", true).eq("is_deleted", false).maybeSingle();
		if (error) throw error;
		return data ? shapeProduct(data) : null;
	}
});
//#endregion
export { resolveImageUrl as i, brandsQuery as n, productBySlugQuery as r, allProductsQuery as t };

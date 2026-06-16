import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as productBySlugQuery, t as allProductsQuery } from "./catalog-ByCdkPSX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/phone._slug-8NhgEBZR.js
var $$splitNotFoundComponentImporter = () => import("./phone._slug-xb7P7Pja.mjs");
var $$splitErrorComponentImporter = () => import("./phone._slug-CDfswEDj.mjs");
var $$splitComponentImporter = () => import("./phone._slug-lc-oi7tW.mjs");
var Route = createFileRoute("/phone/$slug")({
	head: ({ params }) => ({ meta: [{ title: `${params.slug.replace(/-/g, " ")} — USED MOBILES` }, {
		name: "description",
		content: "Pre-owned smartphone in stock at USED MOBILES Hyderabad."
	}] }),
	loader: async ({ context, params }) => {
		await context.queryClient.ensureQueryData(productBySlugQuery(params.slug));
		await context.queryClient.ensureQueryData(allProductsQuery);
	},
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };

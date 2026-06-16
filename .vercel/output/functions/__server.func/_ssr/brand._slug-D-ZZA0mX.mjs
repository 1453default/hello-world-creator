import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as brandsQuery, t as allProductsQuery } from "./catalog-ByCdkPSX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brand._slug-D-ZZA0mX.js
var $$splitNotFoundComponentImporter = () => import("./brand._slug-BtIkt5ti.mjs");
var $$splitErrorComponentImporter = () => import("./brand._slug-Go9uUWW2.mjs");
var $$splitComponentImporter = () => import("./brand2._slug-Dg_R-sde.mjs");
var Route = createFileRoute("/brand/$slug")({
	head: ({ params }) => {
		const name = params.slug.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join(" ");
		return { meta: [
			{ title: `${name} Phones — USED MOBILES Hyderabad` },
			{
				name: "description",
				content: `Pre-owned ${name} smartphones in stock at USED MOBILES.`
			},
			{
				property: "og:title",
				content: `${name} — Pre-Owned at USED MOBILES`
			}
		] };
	},
	loader: async ({ context }) => {
		await Promise.all([context.queryClient.ensureQueryData(brandsQuery), context.queryClient.ensureQueryData(allProductsQuery)]);
	},
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };

import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as allProductsQuery } from "./catalog-ByCdkPSX.mjs";
import { n as stringType, t as objectType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-BsKOwACz.js
var $$splitNotFoundComponentImporter = () => import("./search-mB_G0Y46.mjs");
var $$splitErrorComponentImporter = () => import("./search-D72Gwr0J.mjs");
var $$splitComponentImporter = () => import("./search-BMtaaKqA.mjs");
var searchSchema = objectType({ q: stringType().optional().default("") });
var Route = createFileRoute("/search")({
	validateSearch: (s) => searchSchema.parse(s),
	head: () => ({ meta: [{ title: "Search phones — USED MOBILES" }] }),
	loader: ({ context }) => context.queryClient.ensureQueryData(allProductsQuery),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };

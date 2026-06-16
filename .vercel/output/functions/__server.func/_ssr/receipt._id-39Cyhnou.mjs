import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/receipt._id-39Cyhnou.js
var $$splitNotFoundComponentImporter = () => import("./receipt._id-hTS-_2i5.mjs");
var $$splitErrorComponentImporter = () => import("./receipt._id-CFO_1R4A.mjs");
var $$splitComponentImporter = () => import("./receipt._id-BhWlYips.mjs");
var Route = createFileRoute("/_authenticated/receipt/$id")({
	head: () => ({ meta: [{ title: "Receipt · USED MOBILES" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };

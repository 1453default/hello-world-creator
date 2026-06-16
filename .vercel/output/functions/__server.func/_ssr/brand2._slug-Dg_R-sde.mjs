import { r as useSuspenseQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { N as notFound, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as ChevronLeft } from "../_libs/lucide-react.mjs";
import { t as PublicLayout } from "./PublicLayout-CACtl6X0.mjs";
import { n as brandsQuery, t as allProductsQuery } from "./catalog-ByCdkPSX.mjs";
import { t as Route } from "./brand._slug-D-ZZA0mX.mjs";
import { t as ProductCard } from "./ProductCard-4Pag8YLf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brand2._slug-Dg_R-sde.js
var import_jsx_runtime = require_jsx_runtime();
function BrandPage() {
	const { slug } = Route.useParams();
	const { data: brands } = useSuspenseQuery(brandsQuery);
	const { data: products } = useSuspenseQuery(allProductsQuery);
	const brand = brands.find((b) => b.slug === slug);
	if (!brand) throw notFound();
	const list = products.filter((p) => p.brand?.slug === slug);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 pt-6 md:pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/catalog",
				className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" }), " All phones"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-3xl md:text-4xl font-extrabold tracking-tight",
				children: brand.name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					list.length,
					" ",
					list.length === 1 ? "listing" : "listings",
					" available"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
				children: list.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
					product: p,
					index: i
				}, p.id))
			}),
			list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 text-center text-muted-foreground",
				children: [
					"No ",
					brand.name,
					" phones in stock right now. Check back soon."
				]
			})
		]
	}) });
}
//#endregion
export { BrandPage as component };

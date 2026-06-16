import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, r as useSuspenseQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { p as Search } from "../_libs/lucide-react.mjs";
import { t as PublicLayout } from "./PublicLayout-CACtl6X0.mjs";
import { t as allProductsQuery } from "./catalog-ByCdkPSX.mjs";
import { t as ProductCard } from "./ProductCard-4Pag8YLf.mjs";
import { t as Route } from "./search-BsKOwACz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-BMtaaKqA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const { q } = Route.useSearch();
	const { data: products } = useSuspenseQuery(allProductsQuery);
	const [query, setQuery] = (0, import_react.useState)(q);
	const results = (0, import_react.useMemo)(() => {
		const term = query.trim().toLowerCase();
		if (!term) return products;
		return products.filter((p) => {
			return `${p.name} ${p.brand?.name ?? ""} ${p.storage ?? ""} ${p.color ?? ""}`.toLowerCase().includes(term);
		});
	}, [products, query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl px-4 pt-6 md:pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-extrabold tracking-tight",
				children: "Search"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex h-14 items-center gap-2 rounded-2xl border border-border bg-card pl-4 pr-2 focus-within:border-primary transition",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						value: query,
						onChange: (e) => setQuery(e.target.value),
						placeholder: "iPhone 13, Samsung S23, OnePlus…",
						className: "flex-1 min-w-0 bg-transparent outline-none text-[15px]"
					}),
					query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setQuery(""),
						className: "rounded-md px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground",
						children: "Clear"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted-foreground",
				children: query.trim() ? `${results.length} ${results.length === 1 ? "result" : "results"} for "${query}"` : `Showing all ${results.length} phones in stock.`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4",
				children: results.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
					product: p,
					index: i
				}, p.id))
			})
		]
	}) });
}
//#endregion
export { SearchPage as component };

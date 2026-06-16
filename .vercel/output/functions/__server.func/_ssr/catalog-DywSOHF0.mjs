import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, r as useSuspenseQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as PublicLayout } from "./PublicLayout-CACtl6X0.mjs";
import { n as brandsQuery, t as allProductsQuery } from "./catalog-ByCdkPSX.mjs";
import { t as ProductCard } from "./ProductCard-4Pag8YLf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-DywSOHF0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CatalogPage() {
	const { data: products } = useSuspenseQuery(allProductsQuery);
	const { data: brands } = useSuspenseQuery(brandsQuery);
	const [brand, setBrand] = (0, import_react.useState)(null);
	const [condition, setCondition] = (0, import_react.useState)(null);
	const [sort, setSort] = (0, import_react.useState)("newest");
	const filtered = (0, import_react.useMemo)(() => {
		let list = products.filter((p) => {
			if (brand && p.brand?.slug !== brand) return false;
			if (condition && p.condition !== condition) return false;
			return true;
		});
		if (sort === "price_asc") list = [...list].sort((a, b) => a.selling_price - b.selling_price);
		else if (sort === "price_desc") list = [...list].sort((a, b) => b.selling_price - a.selling_price);
		else list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
		return list;
	}, [
		products,
		brand,
		condition,
		sort
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 pt-6 md:pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl md:text-4xl font-extrabold tracking-tight",
				children: "All Phones"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [products.length, " listings · updated daily"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 overflow-x-auto no-scrollbar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setBrand(null),
						className: `chip ${brand === null ? "chip-active" : ""}`,
						children: "All brands"
					}), brands.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setBrand(brand === b.slug ? null : b.slug),
						className: `chip ${brand === b.slug ? "chip-active" : ""}`,
						children: b.name
					}, b.id))]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [[
						"like_new",
						"good",
						"fair"
					].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setCondition(condition === c ? null : c),
						className: `chip ${condition === c ? "chip-active" : ""}`,
						children: c === "like_new" ? "Like New" : c[0].toUpperCase() + c.slice(1)
					}, c)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ml-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: sort,
							onChange: (e) => setSort(e.target.value),
							className: "h-9 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground focus:border-primary outline-none",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "newest",
									children: "Newest"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "price_asc",
									children: "Price: Low to High"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "price_desc",
									children: "Price: High to Low"
								})
							]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
				children: filtered.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
					product: p,
					index: i
				}, p.id))
			}),
			filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-16 mb-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: "No phones match your filters."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						setBrand(null);
						setCondition(null);
					},
					className: "mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-amber-dark transition",
					children: "Reset filters"
				})]
			})
		]
	}) });
}
//#endregion
export { CatalogPage as component };

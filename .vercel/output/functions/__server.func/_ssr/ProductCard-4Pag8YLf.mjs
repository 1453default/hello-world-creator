import { s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { c as conditionLabel, l as formatINR, u as whatsappLink } from "./shop-DeTn0H1N.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as Smartphone } from "../_libs/lucide-react.mjs";
import { i as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ProductCard-4Pag8YLf.js
var import_jsx_runtime = require_jsx_runtime();
function ProductCard({ product, index = 0 }) {
	const img = product.images[0]?.url;
	const sold = product.available_count === 0;
	const enquire = whatsappLink(`Hi, I'd like to enquire about the ${product.brand?.name ?? ""} ${product.name} (${product.storage ?? ""}, ${product.color ?? ""}).`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 8
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .25,
			delay: Math.min(index * .03, .3)
		},
		className: "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/phone/$slug",
			params: { slug: product.slug },
			className: "block aspect-[4/3] relative bg-muted overflow-hidden",
			children: [
				img ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: img,
					alt: product.name,
					loading: "lazy",
					className: "h-full w-full object-cover transition duration-300 group-hover:scale-105"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-full w-full items-center justify-center text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
						className: "h-12 w-12 opacity-30",
						strokeWidth: 1.25
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute top-2 left-2 flex gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-md border border-black/10 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm",
						children: conditionLabel[product.condition] ?? product.condition
					}), product.is_featured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-md bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm",
						children: "Featured"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute bottom-2 right-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `rounded-full px-2.5 py-1 text-[10px] font-semibold ${sold ? "status-sold" : "status-available"}`,
						children: sold ? "Sold Out" : `${product.available_count} in stock`
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-2 p-3.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-start justify-between gap-2 min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
							children: product.brand?.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/phone/$slug",
							params: { slug: product.slug },
							className: "font-display text-[15px] font-bold text-foreground leading-tight line-clamp-1 hover:text-primary transition",
							children: product.name
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-1 text-[11px] text-muted-foreground",
					children: [
						product.storage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: product.storage }),
						product.ram && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"· ",
							product.ram,
							" RAM"
						] }),
						product.color && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", product.color] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-num text-lg font-bold text-foreground",
						children: formatINR(product.selling_price)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: enquire,
						target: "_blank",
						rel: "noopener",
						onClick: (e) => e.stopPropagation(),
						className: "inline-flex h-9 items-center gap-1.5 rounded-full bg-whatsapp px-3 text-xs font-semibold text-white hover:bg-whatsapp-dark transition",
						children: "Enquire"
					})]
				})
			]
		})]
	});
}
//#endregion
export { ProductCard as t };

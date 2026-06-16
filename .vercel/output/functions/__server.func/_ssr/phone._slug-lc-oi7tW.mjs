import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, r as useSuspenseQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { c as conditionLabel, l as formatINR, o as SHOP_PHONE, u as whatsappLink } from "./shop-DeTn0H1N.mjs";
import { N as notFound, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { N as ChevronLeft, b as MessageCircle, d as ShieldCheck, l as Smartphone, v as Phone } from "../_libs/lucide-react.mjs";
import { i as motion } from "../_libs/framer-motion.mjs";
import { t as PublicLayout } from "./PublicLayout-CACtl6X0.mjs";
import { r as productBySlugQuery, t as allProductsQuery } from "./catalog-ByCdkPSX.mjs";
import { t as ProductCard } from "./ProductCard-4Pag8YLf.mjs";
import { t as Route } from "./phone._slug-8NhgEBZR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/phone._slug-lc-oi7tW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PhoneDetail() {
	const { slug } = Route.useParams();
	const { data: product } = useSuspenseQuery(productBySlugQuery(slug));
	const { data: allProducts } = useSuspenseQuery(allProductsQuery);
	if (!product) throw notFound();
	const sold = product.available_count === 0;
	const [activeImg, setActiveImg] = (0, import_react.useState)(0);
	const images = product.images?.length ? product.images : [];
	const similar = allProducts.filter((p) => p.id !== product.id && p.brand?.slug === product.brand?.slug).slice(0, 4);
	const enquire = whatsappLink(`Hi USED MOBILES! I'm interested in the *${product.brand?.name ?? ""} ${product.name}* — ${product.storage ?? ""}, ${product.color ?? ""}. Is it still available?`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-6xl px-4 pt-4 md:pt-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/catalog",
				className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" }), " Back to catalog"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-6 md:grid-cols-[1.1fr_1fr] md:gap-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: { opacity: 0 },
					animate: { opacity: 1 },
					className: "aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted",
					children: images[activeImg]?.url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: images[activeImg].url,
						alt: product.name,
						className: "h-full w-full object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-full w-full items-center justify-center text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, {
							className: "h-24 w-24 opacity-20",
							strokeWidth: 1.25
						})
					})
				}), images.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 flex gap-2 overflow-x-auto no-scrollbar",
					children: images.map((img, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveImg(i),
						className: `h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === activeImg ? "border-primary" : "border-border"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: img.url,
							alt: "",
							className: "h-full w-full object-cover"
						})
					}, i))
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/brand/$slug",
								params: { slug: product.brand?.slug ?? "" },
								className: "rounded-full bg-accent px-3 py-1 text-xs font-bold text-foreground",
								children: product.brand?.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-card border border-border px-3 py-1 text-xs font-semibold text-foreground",
								children: conditionLabel[product.condition] ?? product.condition
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-3 py-1 text-xs font-semibold ${sold ? "status-sold" : "status-available"}`,
								children: sold ? "Sold Out" : `${product.available_count} in stock`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 font-display text-3xl md:text-4xl font-extrabold tracking-tight leading-tight",
						children: product.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-baseline gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-num text-4xl font-extrabold text-primary",
							children: formatINR(product.selling_price)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: "Final price · taxes incl."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-3 gap-2",
						children: [
							product.storage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, {
								label: "Storage",
								value: product.storage
							}),
							product.ram && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, {
								label: "RAM",
								value: product.ram
							}),
							product.color && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spec, {
								label: "Color",
								value: product.color
							})
						]
					}),
					product.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-semibold mb-2",
							children: "About this phone"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-muted-foreground",
							children: product.description
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 rounded-xl border border-border bg-card p-4 flex gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-emerald shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold",
							children: "Inspected & warranted"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-0.5",
							children: "Every device is tested for battery, display, cameras, and charging before listing."
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-col sm:flex-row gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: enquire,
							target: "_blank",
							rel: "noopener",
							className: "inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-whatsapp px-5 font-bold text-white hover:bg-whatsapp-dark transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5" }), " Enquire on WhatsApp"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: `tel:${SHOP_PHONE.replace(/\s/g, "")}`,
							className: "inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-5 font-bold text-foreground hover:border-primary transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-5 w-5" }), " Call shop"]
						})]
					})
				] })]
			}),
			similar.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-2xl font-bold mb-4",
					children: [
						"More ",
						product.brand?.name,
						" phones"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4",
					children: similar.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
						product: p,
						index: i
					}, p.id))
				})]
			})
		]
	}) });
}
function Spec({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-border bg-card px-3 py-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 text-sm font-bold text-foreground",
			children: value
		})]
	});
}
//#endregion
export { PhoneDetail as component };

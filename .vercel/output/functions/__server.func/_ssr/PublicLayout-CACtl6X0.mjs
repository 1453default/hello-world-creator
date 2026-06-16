import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { i as SHOP_INSTAGRAM_HANDLE, o as SHOP_PHONE, r as SHOP_INSTAGRAM, u as whatsappLink } from "./shop-DeTn0H1N.mjs";
import { g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as House, E as Instagram, S as MapPin, b as MessageCircle, o as Tag, p as Search, v as Phone } from "../_libs/lucide-react.mjs";
import { t as used_mobiles_logo_png_asset_default } from "./used-mobiles-logo.png.asset-TWj9XZzS.mjs";
import { i as motion, n as useTransform, r as useMotionValue, t as useSpring } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PublicLayout-CACtl6X0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ITEMS = [
	{
		to: "/",
		label: "Home",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-5 w-5" }),
		exact: true
	},
	{
		to: "/catalog",
		label: "Catalog",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "h-5 w-5" })
	},
	{
		to: "/search",
		label: "Search",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5" })
	},
	{
		to: "/contact",
		label: "Visit",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5" })
	},
	{
		href: whatsappLink("Hi! I'd like to enquire about a phone."),
		external: true,
		label: "WhatsApp",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5" })
	}
];
function Dock() {
	const mouseX = useMotionValue(Infinity);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 pointer-events-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			onMouseMove: (e) => mouseX.set(e.pageX),
			onMouseLeave: () => mouseX.set(Infinity),
			className: "pointer-events-auto flex items-end gap-2 rounded-2xl border border-border bg-card/90 px-3 py-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/70",
			children: ITEMS.map((it) => {
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DockIcon, {
					mouseX,
					active: it.to ? it.exact ? pathname === it.to : pathname.startsWith(it.to) : false,
					item: it
				}, it.label);
			})
		})
	});
}
function DockIcon({ mouseX, item, active }) {
	const ref = (0, import_react.useRef)(null);
	const width = useSpring(useTransform(useTransform(mouseX, (val) => {
		const bounds = ref.current?.getBoundingClientRect() ?? {
			x: 0,
			width: 0
		};
		return val - bounds.x - bounds.width / 2;
	}), [
		-120,
		0,
		120
	], [
		44,
		64,
		44
	]), {
		mass: .1,
		stiffness: 180,
		damping: 14
	});
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		ref,
		style: {
			width,
			height: width
		},
		className: `flex aspect-square items-center justify-center rounded-xl transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground hover:bg-muted"}`,
		"aria-label": item.label,
		children: item.icon
	});
	if (item.external && item.href) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
		href: item.href,
		target: "_blank",
		rel: "noopener",
		"aria-label": item.label,
		children: content
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: item.to,
		"aria-label": item.label,
		children: content
	});
}
function PublicLayout({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen flex flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 pb-28 md:pb-12",
				children
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicFooter, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dock, {})
		]
	});
}
function PublicHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "flex min-w-0 items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: used_mobiles_logo_png_asset_default.url,
						alt: "USED MOBILES",
						className: "h-10 w-10 shrink-0 object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-display text-base font-extrabold leading-none tracking-tight text-foreground",
							children: "USED MOBILES"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground",
							children: "Buy · Trust"
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "hidden gap-1 md:flex",
					children: [
						{
							to: "/",
							label: "Home"
						},
						{
							to: "/catalog",
							label: "Catalog"
						},
						{
							to: "/contact",
							label: "Contact"
						}
					].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: n.to,
						activeOptions: { exact: n.to === "/" },
						activeProps: { className: "bg-accent text-foreground" },
						className: "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition",
						children: n.label
					}, n.to))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: `tel:${SHOP_PHONE.replace(/\s/g, "")}`,
					className: "inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:border-primary transition",
					"aria-label": "Call shop",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden sm:inline font-num",
						children: SHOP_PHONE
					})]
				})
			]
		})
	});
}
function PublicFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "mt-12 border-t border-border bg-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 mb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: used_mobiles_logo_png_asset_default.url,
						alt: "",
						className: "h-9 w-9 object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display font-extrabold text-foreground",
						children: "USED MOBILES"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
						children: "Buy · Trust"
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground leading-relaxed",
					children: "Hyderabad's trusted destination for certified pre-owned smartphones."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-semibold mb-3 text-foreground",
						children: "Visit Us"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground leading-relaxed",
						children: [
							"Hyder Manzil, 7 Tombs Rd, beside Al Ameen Meat Mart,",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Samata Colony, Toli Chowki, Hyderabad 500008"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Mon–Sat: 10:00 AM – 8:00 PM"
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
						className: "text-sm font-semibold mb-3 text-foreground",
						children: "Contact"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `tel:${SHOP_PHONE.replace(/\s/g, "")}`,
						className: "block text-sm text-foreground hover:text-primary font-num",
						children: SHOP_PHONE
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: whatsappLink(),
						target: "_blank",
						rel: "noopener",
						className: "block text-sm text-foreground hover:text-primary font-num",
						children: ["WhatsApp · ", SHOP_PHONE]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: SHOP_INSTAGRAM,
						target: "_blank",
						rel: "noopener",
						className: "mt-1 inline-flex items-center gap-1.5 text-sm text-foreground hover:text-primary",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instagram, { className: "h-4 w-4" }),
							" ",
							SHOP_INSTAGRAM_HANDLE
						]
					})
				] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-t border-border py-4 text-center text-xs text-muted-foreground",
			children: [
				"© ",
				(/* @__PURE__ */ new Date()).getFullYear(),
				" USED MOBILES · Hyderabad"
			]
		})]
	});
}
//#endregion
export { PublicLayout as t };

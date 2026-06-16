import { s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as SHOP_MAPS_URL, i as SHOP_INSTAGRAM_HANDLE, n as SHOP_HOURS, o as SHOP_PHONE, r as SHOP_INSTAGRAM, t as SHOP_ADDRESS, u as whatsappLink } from "./shop-DeTn0H1N.mjs";
import { E as Instagram, S as MapPin, b as MessageCircle, j as Clock, v as Phone } from "../_libs/lucide-react.mjs";
import { t as PublicLayout } from "./PublicLayout-CACtl6X0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-Qlzcn2qw.js
var import_jsx_runtime = require_jsx_runtime();
function ContactPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PublicLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 pt-6 md:pt-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl md:text-5xl font-extrabold tracking-tight",
				children: "Visit our shop."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-base md:text-lg text-muted-foreground max-w-xl",
				children: "Come in to see, test, and pick your phone in person. We're open six days a week."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid gap-6 md:grid-cols-[1.2fr_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: SHOP_MAPS_URL,
					target: "_blank",
					rel: "noopener",
					className: "aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-muted relative group",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
						title: "USED MOBILES location",
						src: "https://www.google.com/maps?q=Hyder+Manzil+7+Tombs+Rd+Toli+Chowki+Hyderabad&output=embed",
						className: "h-full w-full",
						loading: "lazy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute bottom-3 left-3 right-3 rounded-xl bg-card/95 backdrop-blur p-3 text-sm font-semibold flex items-center gap-2 group-hover:bg-card transition",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-primary" }), " Open in Google Maps"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-5 w-5" }),
							title: "Address",
							children: SHOP_ADDRESS
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-5 w-5" }),
							title: "Phone",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: `tel:${SHOP_PHONE.replace(/\s/g, "")}`,
								className: "font-num text-foreground hover:text-primary",
								children: SHOP_PHONE
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-5 w-5" }),
							title: "Hours",
							children: SHOP_HOURS
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoCard, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instagram, { className: "h-5 w-5" }),
							title: "Instagram",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: SHOP_INSTAGRAM,
								target: "_blank",
								rel: "noopener",
								className: "text-foreground hover:text-primary",
								children: SHOP_INSTAGRAM_HANDLE
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: whatsappLink("Hi USED MOBILES! I'd like to enquire."),
							target: "_blank",
							rel: "noopener",
							className: "mt-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-whatsapp px-5 font-bold text-white hover:bg-whatsapp-dark transition",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5" }), " WhatsApp us"]
						})
					]
				})]
			})
		]
	}) });
}
function InfoCard({ icon, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-3 rounded-xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-primary",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-0.5 text-sm text-foreground leading-relaxed",
				children
			})]
		})]
	});
}
//#endregion
export { ContactPage as component };

import { o as __toESM } from "../_runtime.mjs";
import { c as require_react, r as useSuspenseQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { u as whatsappLink } from "./shop-DeTn0H1N.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { L as ArrowRight, b as MessageCircle, c as Sparkles, d as ShieldCheck, p as Search } from "../_libs/lucide-react.mjs";
import { i as motion } from "../_libs/framer-motion.mjs";
import { t as PublicLayout } from "./PublicLayout-CACtl6X0.mjs";
import { n as brandsQuery, t as allProductsQuery } from "./catalog-ByCdkPSX.mjs";
import { t as ProductCard } from "./ProductCard-4Pag8YLf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dw4WTHgM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BUDGET_BUCKETS = [
	{
		label: "Under ₹10K",
		max: 1e4
	},
	{
		label: "₹10K–20K",
		min: 1e4,
		max: 2e4
	},
	{
		label: "₹20K–30K",
		min: 2e4,
		max: 3e4
	},
	{
		label: "₹30K–50K",
		min: 3e4,
		max: 5e4
	},
	{
		label: "₹50K+",
		min: 5e4
	}
];
function HomePage() {
	const { data: brands } = useSuspenseQuery(brandsQuery);
	const { data: products } = useSuspenseQuery(allProductsQuery);
	const [activeBudget, setActiveBudget] = (0, import_react.useState)(null);
	const [activeBrand, setActiveBrand] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => {
		return products.filter((p) => {
			if (activeBrand && p.brand?.slug !== activeBrand) return false;
			if (activeBudget != null) {
				const b = BUDGET_BUCKETS[activeBudget];
				if (b.min != null && p.selling_price < b.min) return false;
				if (b.max != null && p.selling_price >= b.max) return false;
			}
			return true;
		});
	}, [
		products,
		activeBudget,
		activeBrand
	]);
	const justIn = [...products].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)).slice(0, 8);
	const featured = products.filter((p) => p.is_featured).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PublicLayout, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden border-b border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-gradient-to-br from-amber/5 via-background to-info/5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-4 pt-10 pb-8 md:pt-16 md:pb-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: {
						opacity: 0,
						y: 12
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: { duration: .4 },
					className: "max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-emerald" }), " Tested · Warranted · Fairly Priced"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-4 font-display text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight text-foreground",
							children: [
								"Pre-owned phones ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-primary",
									children: "Hyderabad trusts."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-base md:text-lg text-muted-foreground max-w-xl",
							children: "Carefully refurbished iPhone, Samsung, OnePlus & more — at honest prices, with a warranty. Visit our Toli Chowki store or chat on WhatsApp."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.form, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .4,
						delay: .1
					},
					action: "/search",
					className: "mt-6 flex h-14 max-w-xl items-center gap-2 rounded-2xl border border-border bg-card pl-4 pr-2 shadow-sm focus-within:border-primary transition",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5 text-muted-foreground shrink-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: "q",
							type: "search",
							placeholder: "Search iPhone 13, Galaxy S23, OnePlus…",
							className: "flex-1 min-w-0 bg-transparent outline-none text-[15px] placeholder:text-muted-foreground"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "h-10 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-amber-dark transition",
							children: "Search"
						})
					]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-border bg-card/40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto max-w-6xl px-4 py-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 overflow-x-auto no-scrollbar",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveBrand(null),
						className: `chip ${activeBrand === null ? "chip-active" : ""}`,
						children: "All brands"
					}), brands.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveBrand(activeBrand === b.slug ? null : b.slug),
						className: `chip ${activeBrand === b.slug ? "chip-active" : ""}`,
						children: b.name
					}, b.id))]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-border",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-6xl px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-3 mb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
						children: "Shop by budget"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2 overflow-x-auto no-scrollbar",
					children: BUDGET_BUCKETS.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setActiveBudget(activeBudget === i ? null : i),
						className: `chip ${activeBudget === i ? "chip-active" : ""}`,
						children: b.label
					}, b.label))
				})]
			})
		}),
		(activeBrand || activeBudget != null) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mx-auto max-w-6xl px-4 pt-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-end justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-xl font-bold",
					children: [
						filtered.length,
						" ",
						filtered.length === 1 ? "phone" : "phones",
						" match"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						setActiveBrand(null);
						setActiveBudget(null);
					},
					className: "text-sm font-semibold text-primary hover:underline",
					children: "Clear filters"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
				children: filtered.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
					product: p,
					index: i
				}, p.id))
			})]
		}),
		!activeBrand && activeBudget == null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductRow, {
				title: "Just In",
				subtitle: "Freshly listed this week",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }),
				products: justIn
			}),
			featured.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductRow, {
				title: "Featured Phones",
				subtitle: "Hand-picked by our team",
				products: featured
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-6xl px-4 mt-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-bold mb-1",
						children: "Browse by brand"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mb-6",
						children: "Tap a brand to see every model we have in stock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-3 md:grid-cols-6 gap-3",
						children: brands.map((b, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: {
								opacity: 0,
								y: 6
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								delay: i * .03,
								duration: .2
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/brand/$slug",
								params: { slug: b.slug },
								className: "flex aspect-square flex-col items-center justify-center rounded-xl border border-border bg-card font-display font-bold text-foreground hover:border-primary hover:bg-accent transition text-center px-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm md:text-base",
									children: b.name
								})
							})
						}, b.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-6xl px-4 mt-12 mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl bg-ink text-white p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative z-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-2xl md:text-3xl font-extrabold leading-tight",
								children: "Have a specific phone in mind?"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm md:text-base text-white/70 max-w-md",
								children: "Tell us what you're looking for. We'll WhatsApp you when it's in stock."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: whatsappLink("Hi USED MOBILES, I'm looking for…"),
							target: "_blank",
							rel: "noopener",
							className: "relative z-10 inline-flex h-12 items-center gap-2 rounded-full bg-whatsapp px-6 font-bold text-white hover:bg-whatsapp-dark transition shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "h-5 w-5" }), " Chat with us"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-amber/20 blur-3xl" })
					]
				})
			})
		] })
	] });
}
function ProductRow({ title, subtitle, icon, products }) {
	if (!products.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-auto max-w-6xl px-4 mt-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between mb-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
				children: [
					icon,
					" ",
					subtitle
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl font-bold mt-1",
				children: title
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/catalog",
				className: "inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline",
				children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
			children: products.slice(0, 8).map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductCard, {
				product: p,
				index: i
			}, p.id))
		})]
	});
}
//#endregion
export { HomePage as component };

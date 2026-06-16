import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as ExternalLink, C as LogOut, F as ChartColumn, I as Boxes, T as LayoutDashboard, a as Tags, f as Settings, h as Receipt, l as Smartphone, m as ScrollText, t as Users, u as ShoppingCart, x as Menu } from "../_libs/lucide-react.mjs";
import { t as used_mobiles_logo_png_asset_default } from "./used-mobiles-logo.png.asset-TWj9XZzS.mjs";
import { r as zt, t as Fe } from "../_libs/react-hot-toast.mjs";
import { a as AnimatePresence, i as motion } from "../_libs/framer-motion.mjs";
import { t as useCurrentUser } from "./useCurrentUser-CWCgQ66t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-cWFfp9KS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/admin",
		label: "Dashboard",
		icon: LayoutDashboard,
		exact: true
	},
	{
		to: "/admin/brands",
		label: "Brands",
		icon: Tags
	},
	{
		to: "/admin/products",
		label: "Products",
		icon: Smartphone
	},
	{
		to: "/admin/inventory",
		label: "Inventory",
		icon: Boxes
	},
	{
		to: "/admin/pos",
		label: "POS / Billing",
		icon: ShoppingCart
	},
	{
		to: "/admin/bills",
		label: "Bills",
		icon: Receipt
	},
	{
		to: "/admin/customers",
		label: "Customers",
		icon: Users
	},
	{
		to: "/admin/reports",
		label: "Reports",
		icon: ChartColumn
	},
	{
		to: "/admin/users",
		label: "Users",
		icon: Users,
		adminOnly: true
	},
	{
		to: "/admin/settings",
		label: "Settings",
		icon: Settings,
		adminOnly: true
	},
	{
		to: "/admin/audit",
		label: "Audit Log",
		icon: ScrollText,
		adminOnly: true
	}
];
function AdminLayout({ children }) {
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-admin-bg text-admin-text",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fe, {
			position: "top-right",
			toastOptions: { style: {
				background: "#21262D",
				color: "#E6EDF3"
			} }
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "hidden lg:flex sticky top-0 h-screen w-60 shrink-0 flex-col border-r border-admin-border bg-admin-surface",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: mobileOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: { opacity: 0 },
					animate: { opacity: 1 },
					exit: { opacity: 0 },
					onClick: () => setMobileOpen(false),
					className: "fixed inset-0 z-40 bg-black/60 lg:hidden"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.aside, {
					initial: { x: -260 },
					animate: { x: 0 },
					exit: { x: -260 },
					transition: {
						type: "spring",
						damping: 25,
						stiffness: 240
					},
					className: "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-admin-border bg-admin-surface lg:hidden",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SidebarContent, { onNavigate: () => setMobileOpen(false) })
				})] }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, { onMenu: () => setMobileOpen(true) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.main, {
						initial: {
							opacity: 0,
							y: 6
						},
						animate: {
							opacity: 1,
							y: 0
						},
						transition: {
							duration: .2,
							ease: "easeOut"
						},
						className: "p-4 sm:p-6 lg:p-8",
						children
					})]
				})
			]
		})]
	});
}
function SidebarContent({ onNavigate }) {
	const { isAdmin } = useCurrentUser();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const items = NAV.filter((n) => !n.adminOnly || isAdmin);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-16 items-center gap-2 border-b border-admin-border px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: used_mobiles_logo_png_asset_default.url,
				alt: "",
				className: "h-8 w-8 object-contain"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-sm font-extrabold leading-tight tracking-tight",
					children: "USED MOBILES"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] uppercase tracking-[0.16em] text-admin-muted",
					children: "Admin Console"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "flex-1 overflow-y-auto p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-admin-subtle",
				children: "Operations"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: items.map((item) => {
					const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
					const Icon = item.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						onClick: onNavigate,
						className: `flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${active ? "bg-admin-surface-2 text-admin-text" : "text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: item.label
						})]
					}) }, item.to);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-admin-border p-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				onClick: onNavigate,
				className: "flex h-9 items-center gap-2 rounded-md px-3 text-xs font-medium text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3.5 w-3.5" }), " View public site"]
			})
		})
	] });
}
function TopBar({ onMenu }) {
	const { user, isAdmin } = useCurrentUser();
	const navigate = useNavigate();
	async function signOut() {
		await supabase.auth.signOut();
		zt.success("Signed out");
		navigate({
			to: "/auth",
			replace: true
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-admin-border bg-admin-bg/95 px-4 backdrop-blur sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onMenu,
				className: "inline-flex h-9 w-9 items-center justify-center rounded-md border border-admin-border text-admin-muted hover:text-admin-text lg:hidden",
				"aria-label": "Open menu",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-4 w-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-admin-muted",
				children: "Used Mobiles · Toli Chowki"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hidden text-right sm:block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-semibold text-admin-text leading-tight",
					children: user?.email
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] uppercase tracking-[0.14em] text-admin-muted",
					children: isAdmin ? "Admin" : "Staff"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: signOut,
				className: "inline-flex h-9 items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface px-3 text-xs font-medium text-admin-muted hover:border-ruby/40 hover:text-admin-text",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5" }), " Sign out"]
			})]
		})]
	});
}
var SplitComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLayout, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
//#endregion
export { SplitComponent as component };

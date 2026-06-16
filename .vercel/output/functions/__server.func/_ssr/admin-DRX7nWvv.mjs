import { t as supabase } from "./client-CFqbjQaU.mjs";
import { i as useQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatINR } from "./shop-DeTn0H1N.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { I as Boxes, L as ArrowRight, a as Tags, l as Smartphone, u as ShoppingCart } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DRX7nWvv.js
var import_jsx_runtime = require_jsx_runtime();
function DashboardPage() {
	const { data, isLoading } = useQuery({
		queryKey: ["admin", "dashboard-kpis"],
		queryFn: async () => {
			const today = /* @__PURE__ */ new Date();
			today.setHours(0, 0, 0, 0);
			const iso = today.toISOString();
			const [brands, products, available, billsToday] = await Promise.all([
				supabase.from("brands").select("id", {
					count: "exact",
					head: true
				}),
				supabase.from("products").select("id", {
					count: "exact",
					head: true
				}).eq("is_deleted", false),
				supabase.from("inventory_units").select("id", {
					count: "exact",
					head: true
				}).eq("status", "AVAILABLE"),
				supabase.from("bills").select("grand_total").eq("status", "COMPLETED").gte("created_at", iso)
			]);
			const revenueToday = (billsToday.data ?? []).reduce((sum, b) => sum + Number(b.grand_total ?? 0), 0);
			return {
				brands: brands.count ?? 0,
				products: products.count ?? 0,
				availableUnits: available.count ?? 0,
				soldToday: billsToday.data?.length ?? 0,
				revenueToday
			};
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold tracking-tight text-admin-text",
					children: "Dashboard"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-admin-muted",
					children: "Real-time snapshot of today's counter operations."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/pos",
					className: "hidden sm:inline-flex h-10 items-center gap-2 rounded-md bg-amber px-4 text-sm font-bold text-ink hover:bg-amber-dark transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }), " Open POS"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Available Units",
						value: data?.availableUnits ?? 0,
						icon: Boxes,
						loading: isLoading,
						accent: "emerald"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Bills Today",
						value: data?.soldToday ?? 0,
						icon: ShoppingCart,
						loading: isLoading,
						accent: "amber"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Revenue Today",
						value: formatINR(data?.revenueToday ?? 0),
						icon: ShoppingCart,
						loading: isLoading,
						accent: "info",
						mono: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
						label: "Active Products",
						value: data?.products ?? 0,
						icon: Smartphone,
						loading: isLoading
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
						to: "/admin/inventory",
						icon: Boxes,
						title: "Manage Inventory",
						desc: "Add new units, update IMEIs, change status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
						to: "/admin/products",
						icon: Smartphone,
						title: "Add Product",
						desc: "Create model with specs and images"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
						to: "/admin/brands",
						icon: Tags,
						title: "Brands",
						desc: "Logos, ordering, visibility"
					})
				]
			})
		]
	});
}
function Kpi({ label, value, icon: Icon, loading, accent = "default", mono }) {
	const accentClass = accent === "emerald" ? "text-emerald" : accent === "amber" ? "text-amber" : accent === "info" ? "text-info" : "text-admin-text";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-admin-border bg-admin-surface p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-semibold uppercase tracking-[0.14em] text-admin-muted",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `h-4 w-4 ${accentClass}` })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `mt-3 text-2xl font-bold ${accentClass} ${mono ? "font-mono" : ""}`,
			children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-admin-subtle",
				children: "—"
			}) : value
		})]
	});
}
function QuickAction({ to, icon: Icon, title, desc }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "group flex items-start gap-3 rounded-xl border border-admin-border bg-admin-surface p-5 transition hover:border-amber/40 hover:bg-admin-surface-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid h-9 w-9 place-items-center rounded-md bg-admin-surface-2 text-amber",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-sm font-semibold text-admin-text",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 text-admin-subtle transition group-hover:translate-x-0.5 group-hover:text-amber" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-0.5 text-xs text-admin-muted",
				children: desc
			})]
		})]
	});
}
//#endregion
export { DashboardPage as component };

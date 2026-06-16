import { t as supabase } from "./client-CFqbjQaU.mjs";
import { i as useQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatINR } from "./shop-DeTn0H1N.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-BYIQeUuj.js
var import_jsx_runtime = require_jsx_runtime();
function ReportsPage() {
	const { data } = useQuery({
		queryKey: ["admin", "reports"],
		queryFn: async () => {
			const [{ data: bills }, { data: units }, { data: items }] = await Promise.all([
				supabase.from("bills").select("grand_total, discount, created_at, payment_method").eq("status", "COMPLETED"),
				supabase.from("inventory_units").select("status, cost_price, product:products(selling_price, brand:brands(name))"),
				supabase.from("bill_items").select("product:products(name, brand:brands(name)), line_total, quantity")
			]);
			const now = Date.now();
			(/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
			now - 7 * 864e5;
			now - 30 * 864e5;
			const sum = (xs, days) => xs.filter((b) => !days || +new Date(b.created_at) > now - days * 864e5).reduce((s, b) => s + Number(b.grand_total), 0);
			const available = (units ?? []).filter((u) => u.status === "AVAILABLE");
			const stockValue = available.reduce((s, u) => s + Number(u.product?.selling_price ?? 0), 0);
			const stockCost = available.reduce((s, u) => s + Number(u.cost_price ?? 0), 0);
			const topMap = /* @__PURE__ */ new Map();
			for (const it of items ?? []) {
				const p = it.product;
				if (!p) continue;
				const key = `${p.brand?.name ?? ""} ${p.name}`;
				const cur = topMap.get(key) ?? {
					name: key,
					qty: 0,
					revenue: 0
				};
				cur.qty += Number(it.quantity);
				cur.revenue += Number(it.line_total);
				topMap.set(key, cur);
			}
			const top = Array.from(topMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
			return {
				today: sum(bills ?? [], 1),
				week: sum(bills ?? [], 7),
				month: sum(bills ?? [], 30),
				allTime: sum(bills ?? []),
				billsCount: (bills ?? []).length,
				availableCount: available.length,
				stockValue,
				stockCost,
				top
			};
		}
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-admin-muted",
		children: "Loading…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: "Reports"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-admin-muted",
				children: "Sales and inventory analytics"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Today",
						value: formatINR(data.today)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Last 7 days",
						value: formatINR(data.week)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Last 30 days",
						value: formatINR(data.month)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "All time",
						value: formatINR(data.allTime),
						sub: `${data.billsCount} bills`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Available units",
						value: String(data.availableCount)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Stock value (sell)",
						value: formatINR(data.stockValue)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Stock cost",
						value: formatINR(data.stockCost),
						sub: `Margin ${formatINR(data.stockValue - data.stockCost)}`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-admin-border bg-admin-surface p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display font-bold mb-3",
					children: "Top sellers"
				}), data.top.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-admin-muted",
					children: "No sales yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-left text-xs uppercase tracking-wider text-admin-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "Product"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2",
								children: "Qty"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 text-right",
								children: "Revenue"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-admin-border",
						children: data.top.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2",
								children: t.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2",
								children: t.qty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 text-right font-num font-semibold",
								children: formatINR(t.revenue)
							})
						] }, t.name))
					})]
				})]
			})
		]
	});
}
function Stat({ label, value, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-admin-border bg-admin-surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-semibold uppercase tracking-wider text-admin-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 text-2xl font-bold font-num text-amber",
				children: value
			}),
			sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-admin-muted",
				children: sub
			})
		]
	});
}
//#endregion
export { ReportsPage as component };

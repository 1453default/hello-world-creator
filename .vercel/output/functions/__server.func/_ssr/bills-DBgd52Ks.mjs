import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react, i as useQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatINR } from "./shop-DeTn0H1N.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as Eye, g as Printer } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bills-DBgd52Ks.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BillsPage() {
	const [selected, setSelected] = (0, import_react.useState)(null);
	const { data: bills = [], isLoading } = useQuery({
		queryKey: ["admin", "bills"],
		queryFn: async () => {
			const { data, error } = await supabase.from("bills").select("*").order("created_at", { ascending: false }).limit(200);
			if (error) throw error;
			return data;
		}
	});
	const { data: items = [] } = useQuery({
		queryKey: [
			"admin",
			"bill-items",
			selected
		],
		enabled: !!selected,
		queryFn: async () => {
			const { data } = await supabase.from("bill_items").select("*").eq("bill_id", selected);
			return data ?? [];
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: "Bills"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-admin-muted",
				children: [bills.length, " recent transactions"]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-xl border border-admin-border bg-admin-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Bill #"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Customer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Payment"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Total"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-admin-border",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "px-4 py-8 text-center text-admin-muted",
							children: "Loading…"
						}) }) : bills.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "px-4 py-8 text-center text-admin-muted",
							children: "No bills yet."
						}) }) : bills.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: `hover:bg-admin-surface-2/50 ${selected === b.id ? "bg-admin-surface-2" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									onClick: () => setSelected(b.id === selected ? null : b.id),
									className: "cursor-pointer px-4 py-3 font-mono text-xs",
									children: b.bill_number
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									onClick: () => setSelected(b.id === selected ? null : b.id),
									className: "cursor-pointer px-4 py-3",
									children: [b.customer_name ?? "—", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs text-admin-muted",
										children: b.customer_phone
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-admin-muted",
									children: new Date(b.created_at).toLocaleString()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded bg-admin-surface-2 px-2 py-1 text-xs",
										children: b.payment_method ?? "—"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-num font-bold text-amber",
									children: formatINR(b.grand_total)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/receipt/$id",
										params: { id: b.id },
										target: "_blank",
										title: "View Receipt",
										className: "mr-1 inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: `/receipt/${b.id}?print=1`,
										target: "_blank",
										rel: "noopener",
										title: "Print Receipt",
										className: "inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2 hover:text-amber",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-4 w-4" })
									})]
								})
							]
						}, b.id))
					})]
				})
			}),
			selected && items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-admin-border bg-admin-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 font-display font-bold",
					children: "Bill items"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1 text-sm",
					children: items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between border-b border-admin-border py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: i.description }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-num",
							children: formatINR(i.line_total)
						})]
					}, i.id))
				})]
			})
		]
	});
}
//#endregion
export { BillsPage as component };

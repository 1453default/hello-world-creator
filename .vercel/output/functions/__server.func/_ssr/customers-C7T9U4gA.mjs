import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react, i as useQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatINR } from "./shop-DeTn0H1N.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as ChevronRight, O as Eye, P as ChevronDown } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/customers-C7T9U4gA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CustomersPage() {
	const [expanded, setExpanded] = (0, import_react.useState)(null);
	const { data: customers = [], isLoading } = useQuery({
		queryKey: ["admin", "customers"],
		queryFn: async () => {
			const { data } = await supabase.from("bills").select("customer_name, customer_phone, grand_total, created_at");
			const map = /* @__PURE__ */ new Map();
			for (const b of data ?? []) {
				const key = (b.customer_phone || b.customer_name || "guest").toString();
				const cur = map.get(key) ?? {
					key,
					name: b.customer_name ?? "Guest",
					phone: b.customer_phone ?? "",
					orders: 0,
					spend: 0,
					first: b.created_at,
					last: b.created_at
				};
				cur.orders += 1;
				cur.spend += Number(b.grand_total);
				if (b.created_at > cur.last) cur.last = b.created_at;
				if (b.created_at < cur.first) cur.first = b.created_at;
				map.set(key, cur);
			}
			return Array.from(map.values()).sort((a, b) => b.spend - a.spend);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-bold",
			children: "Customers"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-admin-muted",
			children: [
				"Derived from bills · ",
				customers.length,
				" unique · click a row to view purchase history"
			]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-hidden rounded-xl border border-admin-border bg-admin-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "w-8 px-2 py-3" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Phone"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Orders"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Total Spend"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Last Visit"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-admin-border",
					children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 6,
						className: "px-4 py-8 text-center text-admin-muted",
						children: "Loading…"
					}) }) : customers.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 6,
						className: "px-4 py-8 text-center text-admin-muted",
						children: "No customers yet."
					}) }) : customers.map((c) => {
						const open = expanded === c.key;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							onClick: () => setExpanded(open ? null : c.key),
							className: `cursor-pointer hover:bg-admin-surface-2/50 ${open ? "bg-admin-surface-2" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-2 py-3 text-admin-muted",
									children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-semibold",
									children: c.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-mono text-xs",
									children: c.phone || "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: c.orders
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-num text-amber font-bold",
									children: formatINR(c.spend)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-admin-muted",
									children: new Date(c.last).toLocaleDateString()
								})
							]
						}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "bg-admin-surface-2/40 px-4 py-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerDetail, { customer: c })
						}) })] }, c.key);
					})
				})]
			})
		})]
	});
}
function CustomerDetail({ customer }) {
	const { data: bills = [], isLoading } = useQuery({
		queryKey: [
			"admin",
			"customer-history",
			customer.key
		],
		queryFn: async () => {
			let q = supabase.from("bills").select("id, bill_number, created_at, payment_method, grand_total, items:bill_items(id, description, quantity, unit_price, line_total, inventory_unit:inventory_units(imei), product:products(name, brand:brands(name)))").order("created_at", { ascending: false });
			if (customer.phone) q = q.eq("customer_phone", customer.phone);
			else q = q.eq("customer_name", customer.name);
			const { data, error } = await q;
			if (error) throw error;
			return data ?? [];
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-3 text-xs sm:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "First Purchase",
					value: new Date(customer.first).toLocaleDateString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Last Purchase",
					value: new Date(customer.last).toLocaleDateString()
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Total Orders",
					value: String(customer.orders)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
					label: "Total Spend",
					value: formatINR(customer.spend)
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-2 text-xs font-semibold uppercase tracking-wider text-admin-muted",
				children: "Purchase History"
			}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-admin-muted",
				children: "Loading…"
			}) : bills.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs text-admin-muted",
				children: "No bills."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: bills.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-md border border-admin-border bg-admin-surface p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex flex-wrap items-center justify-between gap-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono font-bold text-admin-text",
									children: ["#", b.bill_number]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-admin-muted",
									children: new Date(b.created_at).toLocaleString()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded bg-admin-surface-2 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-admin-muted",
									children: b.payment_method ?? "—"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-num font-bold text-amber",
								children: formatINR(b.grand_total)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/receipt/$id",
								params: { id: b.id },
								target: "_blank",
								className: "inline-flex h-7 items-center gap-1 rounded border border-admin-border px-2 text-[11px] font-semibold text-admin-muted hover:text-admin-text",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " Receipt"]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "text-left text-[10px] uppercase tracking-wider text-admin-subtle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1",
									children: "Product"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1",
									children: "IMEI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1 text-center",
									children: "Qty"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1 text-right",
									children: "Unit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "py-1 text-right",
									children: "Total"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: b.items.map((it) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-admin-border/60",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5",
										children: it.product ? `${it.product.brand?.name ?? ""} ${it.product.name}`.trim() : it.description ?? "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5 font-mono text-[10px] text-admin-muted",
										children: it.inventory_unit?.imei || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5 text-center",
										children: it.quantity
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5 text-right font-num",
										children: formatINR(it.unit_price)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1.5 text-right font-num font-semibold",
										children: formatINR(it.line_total)
									})
								]
							}, it.id);
						}) })]
					})]
				}, b.id))
			})]
		})]
	});
}
function Info({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md border border-admin-border bg-admin-surface p-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase tracking-wider text-admin-subtle",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 font-semibold text-admin-text",
			children: value
		})]
	});
}
//#endregion
export { CustomersPage as component };

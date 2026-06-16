import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react, i as useQuery, o as useQueryClient, s as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatINR } from "./shop-DeTn0H1N.mjs";
import { i as Trash2, p as Search, u as ShoppingCart } from "../_libs/lucide-react.mjs";
import { r as zt } from "../_libs/react-hot-toast.mjs";
import { t as nextBillNumber } from "./admin-utils-Bc47NslE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pos-D30hPb1C.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function POSPage() {
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [cart, setCart] = (0, import_react.useState)([]);
	const [customerName, setCustomerName] = (0, import_react.useState)("");
	const [customerPhone, setCustomerPhone] = (0, import_react.useState)("");
	const [discount, setDiscount] = (0, import_react.useState)(0);
	const [paymentMethod, setPaymentMethod] = (0, import_react.useState)("CASH");
	const { data: units = [] } = useQuery({
		queryKey: ["pos", "available"],
		queryFn: async () => {
			const { data, error } = await supabase.from("inventory_units").select("id, imei, product_id, product:products(id, name, selling_price, brand:brands(name))").eq("status", "AVAILABLE").limit(200);
			if (error) throw error;
			return data;
		}
	});
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.toLowerCase();
		if (!q) return units.slice(0, 30);
		return units.filter((u) => u.imei?.toLowerCase().includes(q) || u.product?.name.toLowerCase().includes(q) || u.product?.brand?.name.toLowerCase().includes(q)).slice(0, 30);
	}, [units, search]);
	function addToCart(u) {
		if (cart.find((c) => c.unit_id === u.id)) return zt.error("Already in cart");
		if (!u.product) return;
		setCart((c) => [...c, {
			unit_id: u.id,
			product_id: u.product_id,
			description: `${u.product.brand?.name ?? ""} ${u.product.name}${u.imei ? ` (IMEI ${u.imei})` : ""}`.trim(),
			unit_price: Number(u.product.selling_price),
			quantity: 1
		}]);
	}
	const subtotal = cart.reduce((s, c) => s + c.unit_price * c.quantity, 0);
	const grand = Math.max(0, subtotal - discount);
	const checkout = useMutation({
		mutationFn: async () => {
			if (cart.length === 0) throw new Error("Cart is empty");
			const { data: user } = await supabase.auth.getUser();
			const { data: bill, error } = await supabase.from("bills").insert({
				bill_number: nextBillNumber(),
				customer_name: customerName || null,
				customer_phone: customerPhone || null,
				subtotal,
				discount,
				tax: 0,
				grand_total: grand,
				payment_method: paymentMethod,
				status: "COMPLETED",
				created_by: user.user?.id ?? null
			}).select("id, bill_number").single();
			if (error) throw error;
			const items = cart.map((c) => ({
				bill_id: bill.id,
				inventory_unit_id: c.unit_id,
				product_id: c.product_id,
				description: c.description,
				unit_price: c.unit_price,
				quantity: c.quantity,
				line_total: c.unit_price * c.quantity
			}));
			const { error: e2 } = await supabase.from("bill_items").insert(items);
			if (e2) throw e2;
			const { error: e3 } = await supabase.from("inventory_units").update({ status: "SOLD" }).in("id", cart.map((c) => c.unit_id));
			if (e3) throw e3;
			return bill;
		},
		onSuccess: (bill) => {
			zt.success(`Bill ${bill.bill_number} created`);
			setCart([]);
			setCustomerName("");
			setCustomerPhone("");
			setDiscount(0);
			qc.invalidateQueries({ queryKey: ["pos", "available"] });
			qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
			qc.invalidateQueries({ queryKey: ["admin", "bills"] });
			qc.invalidateQueries({ queryKey: ["admin", "dashboard-kpis"] });
			qc.invalidateQueries({ queryKey: ["products", "all"] });
			try {
				window.open(`/receipt/${bill.id}`, "_blank", "noopener");
			} catch {}
		},
		onError: (e) => zt.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[1fr_400px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "Point of Sale"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-admin-muted",
					children: "Search inventory and add to cart"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 rounded-md border border-admin-border bg-admin-surface px-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-admin-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						placeholder: "Search by IMEI, product, brand…",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						className: "h-11 flex-1 bg-transparent outline-none text-sm"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: [filtered.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => addToCart(u),
						className: "flex items-center justify-between rounded-md border border-admin-border bg-admin-surface p-3 text-left hover:border-amber/40",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-semibold text-sm truncate",
								children: [
									u.product?.brand?.name,
									" ",
									u.product?.name
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-[10px] text-admin-muted",
								children: u.imei ?? "no IMEI"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-num font-semibold text-amber",
							children: formatINR(u.product?.selling_price ?? 0)
						})]
					}, u.id)), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "col-span-full text-center text-sm text-admin-muted py-8",
						children: "No matches."
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-3 rounded-xl border border-admin-border bg-admin-surface p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4 text-amber" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display font-bold",
						children: [
							"Cart (",
							cart.length,
							")"
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-64 space-y-2 overflow-y-auto",
					children: [cart.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 rounded-md bg-admin-surface-2 p-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "truncate font-semibold",
								children: c.description
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-num text-admin-muted",
								children: formatINR(c.unit_price)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setCart((cs) => cs.filter((x) => x.unit_id !== c.unit_id)),
							className: "text-admin-muted hover:text-ruby",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
						})]
					}, c.unit_id)), cart.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center text-xs text-admin-muted py-6",
						children: "Cart is empty"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 border-t border-admin-border pt-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							placeholder: "Customer name",
							value: customerName,
							onChange: (e) => setCustomerName(e.target.value),
							className: "admin-input"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							placeholder: "Customer phone",
							value: customerPhone,
							onChange: (e) => setCustomerPhone(e.target.value),
							className: "admin-input"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							value: paymentMethod,
							onChange: (e) => setPaymentMethod(e.target.value),
							className: "admin-input",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "CASH",
									children: "Cash"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "UPI",
									children: "UPI"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "CARD",
									children: "Card"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "OTHER",
									children: "Other"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Discount" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: discount,
								onChange: (e) => setDiscount(Number(e.target.value)),
								className: "admin-input h-8 w-28 text-right"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1 border-t border-admin-border pt-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-admin-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-num",
								children: formatINR(subtotal)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-admin-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Discount" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-num",
								children: ["−", formatINR(discount)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between text-lg font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-num text-amber",
								children: formatINR(grand)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => checkout.mutate(),
					disabled: cart.length === 0 || checkout.isPending,
					className: "w-full h-11 rounded-md bg-amber font-bold text-ink hover:bg-amber-dark disabled:opacity-40",
					children: checkout.isPending ? "Processing…" : "Complete Sale"
				})
			]
		})]
	});
}
//#endregion
export { POSPage as component };

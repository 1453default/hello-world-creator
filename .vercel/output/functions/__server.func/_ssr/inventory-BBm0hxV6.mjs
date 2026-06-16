import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react, i as useQuery, o as useQueryClient, s as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatINR } from "./shop-DeTn0H1N.mjs";
import { _ as Plus, i as Trash2 } from "../_libs/lucide-react.mjs";
import { r as zt } from "../_libs/react-hot-toast.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory-BBm0hxV6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUSES = [
	"AVAILABLE",
	"RESERVED",
	"SOLD",
	"SCRAP"
];
function InventoryPage() {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("");
	const { data: units = [], isLoading } = useQuery({
		queryKey: ["admin", "inventory"],
		queryFn: async () => {
			const { data, error } = await supabase.from("inventory_units").select("*, product:products(name, selling_price, brand:brands(name))").order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const setStatus = useMutation({
		mutationFn: async ({ id, status }) => {
			const { error } = await supabase.from("inventory_units").update({ status }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			zt.success("Status updated");
			qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
			qc.invalidateQueries({ queryKey: ["products", "all"] });
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("inventory_units").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			zt.success("Removed");
			qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
		}
	});
	const filtered = statusFilter ? units.filter((u) => u.status === statusFilter) : units;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "Inventory"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-admin-muted",
					children: [
						units.length,
						" units · ",
						units.filter((u) => u.status === "AVAILABLE").length,
						" available"
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setOpen(true),
					className: "inline-flex h-10 items-center gap-2 rounded-md bg-amber px-4 text-sm font-bold text-ink hover:bg-amber-dark",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Unit"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setStatusFilter(""),
					className: `rounded-md border border-admin-border px-3 py-1.5 text-xs ${!statusFilter ? "bg-admin-surface-2" : ""}`,
					children: "All"
				}), STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setStatusFilter(s),
					className: `rounded-md border border-admin-border px-3 py-1.5 text-xs ${statusFilter === s ? "bg-admin-surface-2" : ""}`,
					children: s
				}, s))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-xl border border-admin-border bg-admin-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Product"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "IMEI"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Cost"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Sell"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-admin-border",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "px-4 py-8 text-center text-admin-muted",
							children: "Loading…"
						}) }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "px-4 py-8 text-center text-admin-muted",
							children: "No units."
						}) }) : filtered.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: u.product?.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-admin-muted",
									children: u.product?.brand?.name
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-mono text-xs",
								children: u.imei ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-num text-admin-muted",
								children: u.cost_price ? formatINR(u.cost_price) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 font-num",
								children: u.product ? formatINR(u.product.selling_price) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
									value: u.status,
									onChange: (e) => setStatus.mutate({
										id: u.id,
										status: e.target.value
									}),
									className: "admin-input h-8 py-0 text-xs",
									children: STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: s }, s))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 text-right",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => confirm("Delete this unit?") && del.mutate(u.id),
									className: "inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-ruby/20 hover:text-ruby",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
								})
							})
						] }, u.id))
					})]
				})
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddUnitDialog, {
				onClose: () => setOpen(false),
				onSaved: () => {
					setOpen(false);
					qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
					qc.invalidateQueries({ queryKey: ["products", "all"] });
				}
			})
		]
	});
}
function AddUnitDialog({ onClose, onSaved }) {
	const [productId, setProductId] = (0, import_react.useState)("");
	const [imei, setImei] = (0, import_react.useState)("");
	const [cost, setCost] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const { data: products = [] } = useQuery({
		queryKey: ["admin", "products-list"],
		queryFn: async () => {
			const { data } = await supabase.from("products").select("id,name,brand:brands(name)").eq("is_deleted", false).order("name");
			return data ?? [];
		}
	});
	async function save(e) {
		e.preventDefault();
		if (!productId) return;
		setSaving(true);
		try {
			const { error } = await supabase.from("inventory_units").insert({
				product_id: productId,
				imei: imei.trim() || null,
				cost_price: cost === "" ? null : Number(cost),
				status: "AVAILABLE"
			});
			if (error) throw error;
			zt.success("Unit added");
			onSaved();
		} catch (e) {
			zt.error(e.message);
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/60 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onClick: (e) => e.stopPropagation(),
			onSubmit: save,
			className: "w-full max-w-md space-y-4 rounded-xl border border-admin-border bg-admin-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-bold",
					children: "Add Inventory Unit"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted",
						children: "Product"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						required: true,
						value: productId,
						onChange: (e) => setProductId(e.target.value),
						className: "admin-input",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "— Select —"
						}), products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
							value: p.id,
							children: [
								p.brand?.name,
								" ",
								p.name
							]
						}, p.id))]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted",
						children: "IMEI (optional, unique)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: imei,
						onChange: (e) => setImei(e.target.value),
						className: "admin-input font-mono"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted",
						children: "Cost Price (₹)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						value: cost,
						onChange: (e) => setCost(e.target.value === "" ? "" : Number(e.target.value)),
						className: "admin-input"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "h-9 rounded-md border border-admin-border px-4 text-sm",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: saving,
						className: "h-9 rounded-md bg-amber px-4 text-sm font-bold text-ink disabled:opacity-50",
						children: saving ? "Saving…" : "Add"
					})]
				})
			]
		})
	});
}
//#endregion
export { InventoryPage as component };

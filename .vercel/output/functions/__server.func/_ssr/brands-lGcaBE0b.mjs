import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react, i as useQuery, o as useQueryClient, s as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { O as Eye, _ as Plus, i as Trash2, k as EyeOff, s as Star, y as Pencil } from "../_libs/lucide-react.mjs";
import { r as zt } from "../_libs/react-hot-toast.mjs";
import { n as slugify } from "./admin-utils-Bc47NslE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brands-lGcaBE0b.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function BrandsPage() {
	const qc = useQueryClient();
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const { data: brands = [], isLoading } = useQuery({
		queryKey: ["admin", "brands"],
		queryFn: async () => {
			const { data, error } = await supabase.from("brands").select("*").order("display_order");
			if (error) throw error;
			return data;
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("brands").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			zt.success("Brand deleted");
			qc.invalidateQueries({ queryKey: ["admin", "brands"] });
			qc.invalidateQueries({ queryKey: ["brands"] });
		},
		onError: (e) => zt.error(e.message)
	});
	const toggle = useMutation({
		mutationFn: async ({ id, patch }) => {
			const { error } = await supabase.from("brands").update(patch).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin", "brands"] });
			qc.invalidateQueries({ queryKey: ["brands"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "Brands"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-admin-muted",
					children: "Manage phone brands shown on the public site."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						setEditing(null);
						setOpen(true);
					},
					className: "inline-flex h-10 items-center gap-2 rounded-md bg-amber px-4 text-sm font-bold text-ink hover:bg-amber-dark",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New Brand"]
				})]
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
								children: "Name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Slug"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Order"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-right",
								children: "Actions"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-admin-border",
						children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 5,
							className: "px-4 py-8 text-center text-admin-muted",
							children: "Loading…"
						}) }) : brands.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 5,
							className: "px-4 py-8 text-center text-admin-muted",
							children: "No brands yet."
						}) }) : brands.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "hover:bg-admin-surface-2/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-semibold",
									children: b.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-admin-muted font-mono text-xs",
									children: b.slug
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: b.display_order
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => toggle.mutate({
												id: b.id,
												patch: { is_visible: !b.is_visible }
											}),
											className: `inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${b.is_visible ? "bg-emerald/20 text-emerald" : "bg-admin-surface-2 text-admin-muted"}`,
											children: [b.is_visible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-3 w-3" }), b.is_visible ? "Visible" : "Hidden"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => toggle.mutate({
												id: b.id,
												patch: { is_featured: !b.is_featured }
											}),
											className: `inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${b.is_featured ? "bg-amber/20 text-amber" : "bg-admin-surface-2 text-admin-muted"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3" }),
												" ",
												b.is_featured ? "Featured" : "Normal"
											]
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setEditing(b);
											setOpen(true);
										},
										className: "mr-2 inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => confirm(`Delete ${b.name}?`) && del.mutate(b.id),
										className: "inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-ruby/20 hover:text-ruby",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
									})]
								})
							]
						}, b.id))
					})]
				})
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandDialog, {
				brand: editing,
				onClose: () => setOpen(false),
				onSaved: () => {
					setOpen(false);
					qc.invalidateQueries({ queryKey: ["admin", "brands"] });
					qc.invalidateQueries({ queryKey: ["brands"] });
				}
			})
		]
	});
}
function BrandDialog({ brand, onClose, onSaved }) {
	const [name, setName] = (0, import_react.useState)(brand?.name ?? "");
	const [slug, setSlug] = (0, import_react.useState)(brand?.slug ?? "");
	const [order, setOrder] = (0, import_react.useState)(brand?.display_order ?? 0);
	const [featured, setFeatured] = (0, import_react.useState)(brand?.is_featured ?? false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	async function save(e) {
		e.preventDefault();
		if (!name.trim()) return;
		setSaving(true);
		try {
			const finalSlug = slug.trim() || slugify(name);
			const payload = {
				name: name.trim(),
				slug: finalSlug,
				display_order: order,
				is_featured: featured
			};
			const { error } = brand ? await supabase.from("brands").update(payload).eq("id", brand.id) : await supabase.from("brands").insert(payload);
			if (error) throw error;
			zt.success(brand ? "Updated" : "Created");
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-lg font-bold",
					children: [brand ? "Edit" : "New", " Brand"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						onChange: (e) => {
							setName(e.target.value);
							if (!brand) setSlug(slugify(e.target.value));
						},
						required: true,
						className: "admin-input"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Slug",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: slug,
						onChange: (e) => setSlug(e.target.value),
						className: "admin-input font-mono text-sm"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Display Order",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "number",
						value: order,
						onChange: (e) => setOrder(Number(e.target.value)),
						className: "admin-input"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-center gap-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: featured,
						onChange: (e) => setFeatured(e.target.checked)
					}), "Featured on home page"]
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
						children: saving ? "Saving…" : "Save"
					})]
				})
			]
		})
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted",
			children: label
		}), children]
	});
}
//#endregion
export { BrandsPage as component };

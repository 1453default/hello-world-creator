import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react, i as useQuery, o as useQueryClient, s as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatINR } from "./shop-DeTn0H1N.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as ExternalLink, O as Eye, _ as Plus, i as Trash2, k as EyeOff, n as Upload, s as Star, w as LoaderCircle, y as Pencil } from "../_libs/lucide-react.mjs";
import { r as zt } from "../_libs/react-hot-toast.mjs";
import { i as resolveImageUrl } from "./catalog-ByCdkPSX.mjs";
import { n as slugify } from "./admin-utils-Bc47NslE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/products-BH0ExlZq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BUCKET = "product-images";
function proxyUrl(path) {
	return `/api/public/img/${BUCKET}/${path}`;
}
function ProductImagesManager({ productId }) {
	const qc = useQueryClient();
	const { data: images = [], isLoading, refetch } = useQuery({
		queryKey: [
			"admin",
			"product-images",
			productId
		],
		queryFn: async () => {
			const { data, error } = await supabase.from("product_images").select("id, url, is_primary, display_order").eq("product_id", productId).order("display_order").order("created_at");
			if (error) throw error;
			return data;
		}
	});
	const [uploading, setUploading] = (0, import_react.useState)(false);
	async function handleFiles(files) {
		if (!files || files.length === 0) return;
		setUploading(true);
		try {
			const existingCount = images.length;
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const ext = file.name.split(".").pop() || "jpg";
				const path = `${productId}/${Date.now()}-${i}.${ext}`;
				const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
					cacheControl: "3600",
					upsert: false,
					contentType: file.type
				});
				if (upErr) throw upErr;
				const url = proxyUrl(path);
				const { error: insErr } = await supabase.from("product_images").insert({
					product_id: productId,
					url,
					is_primary: existingCount === 0 && i === 0,
					display_order: existingCount + i
				});
				if (insErr) throw insErr;
			}
			zt.success("Image(s) uploaded");
			await refetch();
			qc.invalidateQueries({ queryKey: ["products", "all"] });
		} catch (e) {
			zt.error(e.message);
		} finally {
			setUploading(false);
		}
	}
	const setPrimary = useMutation({
		mutationFn: async (id) => {
			await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
			const { error } = await supabase.from("product_images").update({ is_primary: true }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			refetch();
			qc.invalidateQueries({ queryKey: ["products", "all"] });
		}
	});
	const del = useMutation({
		mutationFn: async (img) => {
			const marker = `/${BUCKET}/`;
			const idx = img.url.indexOf(marker);
			if (idx > -1) {
				const path = img.url.substring(idx + marker.length).split("?")[0];
				await supabase.storage.from(BUCKET).remove([path]);
			}
			const { error } = await supabase.from("product_images").delete().eq("id", img.id);
			if (error) throw error;
		},
		onSuccess: () => {
			zt.success("Removed");
			refetch();
			qc.invalidateQueries({ queryKey: ["products", "all"] });
		},
		onError: (e) => zt.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs font-semibold uppercase tracking-wider text-admin-muted",
				children: "Images"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-admin-border bg-admin-surface-2 px-3 py-1.5 text-xs font-semibold text-admin-text hover:border-amber/50",
				children: [
					uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5" }),
					uploading ? "Uploading…" : "Upload",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "file",
						multiple: true,
						accept: "image/*",
						className: "hidden",
						onChange: (e) => handleFiles(e.target.files),
						disabled: uploading
					})
				]
			})]
		}), isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xs text-admin-muted",
			children: "Loading…"
		}) : images.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-md border border-dashed border-admin-border bg-admin-surface-2 p-4 text-center text-xs text-admin-muted",
			children: "No images yet — upload one or more."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-2 sm:grid-cols-4",
			children: images.map((img) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "group relative aspect-square overflow-hidden rounded-md border border-admin-border bg-admin-surface-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: resolveImageUrl(img.url),
						alt: "",
						className: "h-full w-full object-cover"
					}),
					img.is_primary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute left-1 top-1 rounded bg-amber px-1.5 py-0.5 text-[9px] font-bold text-ink",
						children: "Primary"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100",
						children: [!img.is_primary && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setPrimary.mutate(img.id),
							className: "rounded bg-amber p-1.5 text-ink",
							title: "Set primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => del.mutate(img),
							className: "rounded bg-ruby p-1.5 text-white",
							title: "Delete",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
						})]
					})
				]
			}, img.id))
		})]
	});
}
function ProductsPage() {
	const qc = useQueryClient();
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [filter, setFilter] = (0, import_react.useState)("");
	const { data: products = [], isLoading } = useQuery({
		queryKey: ["admin", "products"],
		queryFn: async () => {
			const { data, error } = await supabase.from("products").select("*, brand:brands(name)").eq("is_deleted", false).order("created_at", { ascending: false });
			if (error) throw error;
			return data;
		}
	});
	const { data: brands = [] } = useQuery({
		queryKey: ["admin", "brands-list"],
		queryFn: async () => {
			const { data } = await supabase.from("brands").select("id,name").order("name");
			return data ?? [];
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("products").update({ is_deleted: true }).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			zt.success("Product removed");
			qc.invalidateQueries({ queryKey: ["admin", "products"] });
			qc.invalidateQueries({ queryKey: ["products", "all"] });
		}
	});
	const toggle = useMutation({
		mutationFn: async ({ id, patch }) => {
			const { error } = await supabase.from("products").update(patch).eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["admin", "products"] });
			qc.invalidateQueries({ queryKey: ["products", "all"] });
		}
	});
	const filtered = products.filter((p) => !filter || p.name.toLowerCase().includes(filter.toLowerCase()) || p.brand?.name.toLowerCase().includes(filter.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl font-bold",
					children: "Products"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-admin-muted",
					children: "Phone models shown in the catalog."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						setEditing(null);
						setOpen(true);
					},
					className: "inline-flex h-10 items-center gap-2 rounded-md bg-amber px-4 text-sm font-bold text-ink hover:bg-amber-dark",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " New Product"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				placeholder: "Filter by name or brand…",
				value: filter,
				onChange: (e) => setFilter(e.target.value),
				className: "admin-input max-w-sm"
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
								children: "Brand"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Storage"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Price"
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
							colSpan: 6,
							className: "px-4 py-8 text-center text-admin-muted",
							children: "Loading…"
						}) }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 6,
							className: "px-4 py-8 text-center text-admin-muted",
							children: "No products."
						}) }) : filtered.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "hover:bg-admin-surface-2/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold",
										children: p.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono text-[10px] text-admin-subtle",
										children: p.slug
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-admin-muted",
									children: p.brand?.name ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 text-admin-muted",
									children: p.storage ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3 font-num font-semibold",
									children: formatINR(p.selling_price)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => toggle.mutate({
												id: p.id,
												patch: { is_listed: !p.is_listed }
											}),
											className: `inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${p.is_listed ? "bg-emerald/20 text-emerald" : "bg-admin-surface-2 text-admin-muted"}`,
											children: [p.is_listed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-3 w-3" }), p.is_listed ? "Live" : "Draft"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => toggle.mutate({
												id: p.id,
												patch: { is_featured: !p.is_featured }
											}),
											className: `inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${p.is_featured ? "bg-amber/20 text-amber" : "bg-admin-surface-2 text-admin-muted"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3" })
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-4 py-3 text-right",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/phone/$slug",
											params: { slug: p.slug },
											target: "_blank",
											className: "mr-1 inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => {
												setEditing(p);
												setOpen(true);
											},
											className: "mr-1 inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-admin-surface-2 hover:text-admin-text",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => confirm(`Delete ${p.name}?`) && del.mutate(p.id),
											className: "inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-ruby/20 hover:text-ruby",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
										})
									]
								})
							]
						}, p.id))
					})]
				})
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductDialog, {
				product: editing,
				brands,
				onClose: () => setOpen(false),
				onSaved: () => {
					setOpen(false);
					qc.invalidateQueries({ queryKey: ["admin", "products"] });
					qc.invalidateQueries({ queryKey: ["products", "all"] });
				}
			})
		]
	});
}
function ProductDialog({ product, brands, onClose, onSaved }) {
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)({
		name: product?.name ?? "",
		slug: product?.slug ?? "",
		brand_id: product?.brand_id ?? brands[0]?.id ?? "",
		storage: product?.storage ?? "",
		ram: product?.ram ?? "",
		color: product?.color ?? "",
		condition: product?.condition ?? "good",
		selling_price: product?.selling_price ?? 0,
		description: product?.description ?? "",
		is_featured: product?.is_featured ?? false,
		is_listed: product?.is_listed ?? true,
		imei: "",
		cost_price: ""
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [createdId, setCreatedId] = (0, import_react.useState)(product?.id ?? null);
	function set(k, v) {
		setForm((f) => ({
			...f,
			[k]: v
		}));
	}
	async function save(e) {
		e.preventDefault();
		setSaving(true);
		try {
			const finalSlug = form.slug.trim() || slugify(form.name);
			const payload = {
				name: form.name.trim(),
				slug: finalSlug,
				brand_id: form.brand_id || null,
				storage: form.storage || null,
				ram: form.ram || null,
				color: form.color || null,
				condition: form.condition,
				selling_price: Number(form.selling_price),
				description: form.description || null,
				is_featured: form.is_featured,
				is_listed: form.is_listed
			};
			if (createdId) {
				const { error } = await supabase.from("products").update(payload).eq("id", createdId);
				if (error) throw error;
				zt.success("Updated");
				onSaved();
			} else {
				const { data, error } = await supabase.from("products").insert(payload).select("id").single();
				if (error) throw error;
				const { error: invErr } = await supabase.from("inventory_units").insert({
					product_id: data.id,
					imei: form.imei.trim() || null,
					cost_price: form.cost_price === "" ? null : Number(form.cost_price),
					status: "AVAILABLE"
				});
				if (invErr) throw invErr;
				setCreatedId(data.id);
				qc.invalidateQueries({ queryKey: ["admin", "inventory"] });
				zt.success("Product created with 1 inventory unit — add images");
			}
		} catch (e) {
			zt.error(e.message);
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onClick: (e) => e.stopPropagation(),
			onSubmit: save,
			className: "my-8 w-full max-w-2xl space-y-4 rounded-xl border border-admin-border bg-admin-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-lg font-bold",
					children: [product || createdId ? "Edit" : "New", " Product"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.name,
								onChange: (e) => {
									set("name", e.target.value);
									if (!product && !createdId) set("slug", slugify(e.target.value));
								},
								required: true,
								className: "admin-input"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Slug",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.slug,
								onChange: (e) => set("slug", e.target.value),
								className: "admin-input font-mono text-sm"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Brand",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: form.brand_id,
								onChange: (e) => set("brand_id", e.target.value),
								className: "admin-input",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "— None —"
								}), brands.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: b.id,
									children: b.name
								}, b.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Condition",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: form.condition,
								onChange: (e) => set("condition", e.target.value),
								className: "admin-input",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "like_new",
										children: "Like New"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "good",
										children: "Good"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "fair",
										children: "Fair"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "poor",
										children: "Poor"
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Storage",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.storage,
								onChange: (e) => set("storage", e.target.value),
								className: "admin-input",
								placeholder: "128GB"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "RAM",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.ram,
								onChange: (e) => set("ram", e.target.value),
								className: "admin-input",
								placeholder: "8GB"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Color",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.color,
								onChange: (e) => set("color", e.target.value),
								className: "admin-input"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Selling Price (₹)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: form.selling_price,
								onChange: (e) => set("selling_price", Number(e.target.value)),
								className: "admin-input"
							})
						})
					]
				}),
				!createdId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 rounded-lg border border-amber/20 bg-amber/5 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "IMEI (initial unit, optional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.imei,
								onChange: (e) => set("imei", e.target.value),
								className: "admin-input font-mono",
								placeholder: "15-digit IMEI",
								maxLength: 20
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Cost Price (₹, optional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "number",
								value: form.cost_price,
								onChange: (e) => set("cost_price", e.target.value === "" ? "" : Number(e.target.value)),
								className: "admin-input"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "col-span-2 text-[11px] text-admin-muted",
							children: "An AVAILABLE inventory unit will be created automatically so the product appears in stock."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Description",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: form.description,
						onChange: (e) => set("description", e.target.value),
						rows: 3,
						className: "admin-input"
					})
				}),
				createdId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border border-admin-border bg-admin-surface-2 p-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductImagesManager, { productId: createdId })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-md border border-dashed border-admin-border bg-admin-surface-2 p-3 text-xs text-admin-muted",
					children: "Save the product first, then upload images."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: form.is_listed,
							onChange: (e) => set("is_listed", e.target.checked)
						}), " Listed (live on site)"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: form.is_featured,
							onChange: (e) => set("is_featured", e.target.checked)
						}), " Featured"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "h-9 rounded-md border border-admin-border px-4 text-sm",
						children: createdId ? "Done" : "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: saving,
						className: "h-9 rounded-md bg-amber px-4 text-sm font-bold text-ink disabled:opacity-50",
						children: saving ? "Saving…" : createdId ? "Save Changes" : "Create"
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
export { ProductsPage as component };

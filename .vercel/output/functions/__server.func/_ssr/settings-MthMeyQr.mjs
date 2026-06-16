import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react, i as useQuery, o as useQueryClient, s as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { r as TriangleAlert } from "../_libs/lucide-react.mjs";
import { r as zt } from "../_libs/react-hot-toast.mjs";
import { t as useCurrentUser } from "./useCurrentUser-CWCgQ66t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-MthMeyQr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FIELDS = [
	{
		key: "shop_name",
		label: "Shop Name"
	},
	{
		key: "shop_address",
		label: "Address"
	},
	{
		key: "shop_phone",
		label: "Phone"
	},
	{
		key: "shop_email",
		label: "Email"
	},
	{
		key: "instagram_url",
		label: "Instagram URL"
	},
	{
		key: "gst_number",
		label: "GST Number"
	},
	{
		key: "tax_rate",
		label: "Tax Rate (%)",
		type: "number"
	},
	{
		key: "receipt_footer",
		label: "Receipt Footer"
	}
];
function SettingsPage() {
	const { isAdmin, loading } = useCurrentUser();
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)({});
	const { data: settings } = useQuery({
		queryKey: ["shop_settings"],
		queryFn: async () => {
			const { data } = await supabase.from("shop_settings").select("key,value");
			return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
		}
	});
	(0, import_react.useEffect)(() => {
		if (settings) setForm(settings);
	}, [settings]);
	const save = useMutation({
		mutationFn: async () => {
			const rows = Object.entries(form).map(([key, value]) => ({
				key,
				value
			}));
			const { error } = await supabase.from("shop_settings").upsert(rows, { onConflict: "key" });
			if (error) throw error;
		},
		onSuccess: () => {
			zt.success("Settings saved");
			qc.invalidateQueries({ queryKey: ["shop_settings"] });
		},
		onError: (e) => zt.error(e.message)
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-admin-muted",
		children: "Loading…"
	});
	if (!isAdmin) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl border border-admin-border bg-admin-surface p-6 text-admin-muted",
		children: "Admin access required."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-bold",
				children: "Shop Settings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-admin-muted",
				children: "Configure shop information, tax, and receipts."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					save.mutate();
				},
				className: "space-y-4 rounded-xl border border-admin-border bg-admin-surface p-6",
				children: [FIELDS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-xs font-semibold uppercase tracking-wider text-admin-muted",
						children: f.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: f.type ?? "text",
						value: form[f.key] ?? "",
						onChange: (e) => setForm((s) => ({
							...s,
							[f.key]: e.target.value
						})),
						className: "admin-input"
					})]
				}, f.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: save.isPending,
					className: "h-10 rounded-md bg-amber px-5 text-sm font-bold text-ink disabled:opacity-50",
					children: save.isPending ? "Saving…" : "Save Settings"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DangerZone, {})
		]
	});
}
function DangerZone() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border-2 border-ruby/40 bg-ruby/5 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-ruby" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-bold text-ruby",
					children: "Danger Zone"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-admin-muted",
				children: "Irreversible destructive operations. Use with extreme caution."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DangerAction, {
					title: "Delete all customer history",
					description: "Removes every customer record. Inventory and product data are kept. This cannot be undone.",
					phrase: "DELETE ALL CUSTOMERS",
					action: async () => {
						const { error } = await supabase.from("bills").update({
							customer_name: null,
							customer_phone: null
						}).not("id", "is", null);
						if (error) throw error;
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DangerAction, {
					title: "Delete all bill history",
					description: "Wipes every bill and bill_item record. Inventory units sold via these bills will be reset to AVAILABLE. This cannot be undone.",
					phrase: "DELETE ALL BILLS",
					action: async () => {
						await supabase.from("inventory_units").update({ status: "AVAILABLE" }).eq("status", "SOLD");
						await supabase.from("bill_items").delete().not("id", "is", null);
						const { error } = await supabase.from("bills").delete().not("id", "is", null);
						if (error) throw error;
					}
				})]
			})
		]
	});
}
function DangerAction({ title, description, phrase, action }) {
	const qc = useQueryClient();
	const [stage, setStage] = (0, import_react.useState)(0);
	const [typed, setTyped] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	function reset() {
		setStage(0);
		setTyped("");
	}
	async function run() {
		if (typed !== phrase) {
			zt.error("Confirmation phrase does not match");
			return;
		}
		setBusy(true);
		try {
			await action();
			zt.success(`${title} — done`);
			qc.invalidateQueries();
			reset();
		} catch (e) {
			zt.error(e.message);
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-ruby/30 bg-admin-surface p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold text-admin-text",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 text-xs text-admin-muted",
						children: description
					})]
				}), stage === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setStage(1),
					className: "h-9 shrink-0 rounded-md border border-ruby/50 bg-ruby/10 px-3 text-xs font-semibold text-ruby hover:bg-ruby/20",
					children: "Delete…"
				})]
			}),
			stage === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-md border border-ruby/30 bg-ruby/5 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-admin-text",
					children: [
						"Are you absolutely sure? This action ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "cannot be undone" }),
						"."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: reset,
						className: "h-8 rounded-md border border-admin-border px-3 text-xs",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setStage(2),
						className: "h-8 rounded-md bg-ruby px-3 text-xs font-semibold text-white",
						children: "Yes, proceed"
					})]
				})]
			}),
			stage === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 rounded-md border border-ruby/30 bg-ruby/5 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-admin-text",
						children: [
							"Type ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
								className: "rounded bg-admin-surface-2 px-1.5 py-0.5 font-mono text-ruby",
								children: phrase
							}),
							" to confirm:"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: typed,
						onChange: (e) => setTyped(e.target.value),
						placeholder: phrase,
						className: "admin-input mt-2 font-mono",
						autoFocus: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: reset,
							className: "h-8 rounded-md border border-admin-border px-3 text-xs",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: run,
							disabled: busy || typed !== phrase,
							className: "h-8 rounded-md bg-ruby px-3 text-xs font-semibold text-white disabled:opacity-40",
							children: busy ? "Deleting…" : "I understand, delete"
						})]
					})
				]
			})
		]
	});
}
//#endregion
export { SettingsPage as component };

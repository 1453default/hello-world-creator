import { t as supabase } from "./client-CFqbjQaU.mjs";
import { i as useQuery, o as useQueryClient, s as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { i as Trash2 } from "../_libs/lucide-react.mjs";
import { r as zt } from "../_libs/react-hot-toast.mjs";
import { t as useCurrentUser } from "./useCurrentUser-CWCgQ66t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-DVnWsZWD.js
var import_jsx_runtime = require_jsx_runtime();
function UsersPage() {
	const { isAdmin, loading } = useCurrentUser();
	const qc = useQueryClient();
	const { data: roles = [] } = useQuery({
		queryKey: ["admin", "user-roles"],
		enabled: isAdmin,
		queryFn: async () => {
			const { data } = await supabase.from("user_roles").select("id, user_id, role, created_at").order("created_at", { ascending: false });
			return data ?? [];
		}
	});
	const del = useMutation({
		mutationFn: async (id) => {
			const { error } = await supabase.from("user_roles").delete().eq("id", id);
			if (error) throw error;
		},
		onSuccess: () => {
			zt.success("Role removed");
			qc.invalidateQueries({ queryKey: ["admin", "user-roles"] });
		}
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
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-bold",
			children: "Users & Roles"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-admin-muted",
			children: "Manage staff and admin role assignments. To add a user, sign them in via /auth, then grant a role via SQL or here once their user_id is known."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-hidden rounded-xl border border-admin-border bg-admin-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "bg-admin-surface-2 text-left text-xs uppercase tracking-wider text-admin-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "User ID"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Role"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3",
							children: "Granted"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y divide-admin-border",
					children: roles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: 4,
						className: "px-4 py-8 text-center text-admin-muted",
						children: "No role assignments."
					}) }) : roles.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 font-mono text-xs",
							children: r.user_id
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded bg-amber/20 px-2 py-1 text-xs font-bold text-amber",
								children: r.role
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-admin-muted",
							children: new Date(r.created_at).toLocaleDateString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => confirm("Remove this role?") && del.mutate(r.id),
								className: "inline-flex h-8 w-8 items-center justify-center rounded text-admin-muted hover:bg-ruby/20 hover:text-ruby",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
							})
						})
					] }, r.id))
				})]
			})
		})]
	});
}
//#endregion
export { UsersPage as component };

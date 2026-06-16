import { t as supabase } from "./client-CFqbjQaU.mjs";
import { i as useQuery, s as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { l as formatINR } from "./shop-DeTn0H1N.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-Lj11UyQJ.js
var import_jsx_runtime = require_jsx_runtime();
function AuditPage() {
	const { data: events = [] } = useQuery({
		queryKey: ["admin", "audit"],
		queryFn: async () => {
			const { data: bills } = await supabase.from("bills").select("id, bill_number, grand_total, created_at").order("created_at", { ascending: false }).limit(50);
			return (bills ?? []).map((b) => ({
				when: b.created_at,
				what: `Bill ${b.bill_number} · ${formatINR(b.grand_total)}`
			}));
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-bold",
			children: "Audit Log"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-admin-muted",
			children: "Recent activity. A dedicated audit table is planned for Phase 13."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-xl border border-admin-border bg-admin-surface",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-admin-border",
				children: events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-4 py-8 text-center text-admin-muted",
					children: "No events."
				}) : events.map((e, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between px-4 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: e.what }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-admin-muted",
						children: new Date(e.when).toLocaleString()
					})]
				}, i))
			})
		})]
	});
}
//#endregion
export { AuditPage as component };

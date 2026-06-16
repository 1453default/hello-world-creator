import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-CFqbjQaU.mjs";
import { c as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useCurrentUser-CWCgQ66t.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useCurrentUser() {
	const [user, setUser] = (0, import_react.useState)(null);
	const [roles, setRoles] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let active = true;
		async function load() {
			const { data } = await supabase.auth.getUser();
			if (!active) return;
			setUser(data.user ?? null);
			if (data.user) {
				const { data: r } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
				if (!active) return;
				setRoles((r ?? []).map((x) => x.role));
			}
			setLoading(false);
		}
		load();
		const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
			setUser(session?.user ?? null);
		});
		return () => {
			active = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	return {
		user,
		roles,
		isAdmin: roles.includes("admin") || roles.includes("super_admin"),
		loading
	};
}
//#endregion
export { useCurrentUser as t };

import { supabaseAdmin } from "./client.server-D1oHePJa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bootstrap-admin.server-CzdEiR5n.js
var ADMIN_EMAIL = "admin@usedmobile.in";
var ADMIN_PASSWORD = "UMH_ISVO@4640";
var bootstrapped = false;
async function ensureDefaultAdmin() {
	if (bootstrapped) return {
		created: false,
		userId: null
	};
	const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
		page: 1,
		perPage: 200
	});
	if (listErr) throw listErr;
	let existing = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
	let created = false;
	if (!existing) {
		const { data: createRes, error: createErr } = await supabaseAdmin.auth.admin.createUser({
			email: ADMIN_EMAIL,
			password: ADMIN_PASSWORD,
			email_confirm: true,
			user_metadata: { full_name: "Administrator" }
		});
		if (createErr) throw createErr;
		existing = createRes.user;
		created = true;
	}
	if (existing) {
		const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", existing.id);
		if (!(roles ?? []).some((r) => r.role === "admin")) await supabaseAdmin.from("user_roles").insert({
			user_id: existing.id,
			role: "admin"
		});
	}
	bootstrapped = true;
	return {
		created,
		userId: existing?.id ?? null
	};
}
//#endregion
export { ensureDefaultAdmin };

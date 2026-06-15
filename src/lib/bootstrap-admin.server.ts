// Server-only. Never imported from client code.
// Seeds the default admin account if missing. Idempotent.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_EMAIL = "admin@usedmobile.in";
const ADMIN_PASSWORD = "UMH_ISVO@4640";

let bootstrapped = false;

export async function ensureDefaultAdmin(): Promise<{ created: boolean; userId: string | null }> {
  if (bootstrapped) return { created: false, userId: null };

  // Try to find existing user by email
  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;

  let existing = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
  let created = false;

  if (!existing) {
    const { data: createRes, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Administrator" },
    });
    if (createErr) throw createErr;
    existing = createRes.user!;
    created = true;
  }

  if (existing) {
    // Ensure admin role assigned
    const { data: roles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", existing.id);
    const hasAdmin = (roles ?? []).some((r: { role: string }) => r.role === "admin");
    if (!hasAdmin) {
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: existing.id, role: "admin" });
    }
  }

  bootstrapped = true;
  return { created, userId: existing?.id ?? null };
}

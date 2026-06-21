// Admin-only destructive server functions. Caller must be authenticated AND have admin role.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export const deleteAllCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bills")
      .update({ customer_name: null, customer_phone: null })
      .not("id", "is", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAllBills = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("inventory_units")
      .update({ status: "AVAILABLE" })
      .eq("status", "SOLD");
    await supabaseAdmin.from("bill_items").delete().not("id", "is", null);
    const { error } = await supabaseAdmin.from("bills").delete().not("id", "is", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

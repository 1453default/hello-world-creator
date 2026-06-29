// Admin-only destructive server functions. Caller must be authenticated AND have admin role.
// Uses the authenticated user's Supabase client (RLS-enforced) — staff/admin policies on
// bills, bill_items, and inventory_units grant the required access. This avoids depending on
// SUPABASE_SERVICE_ROLE_KEY at runtime.
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
    const { error } = await context.supabase
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
    // Reset inventory units sold via any bill back to AVAILABLE.
    const { error: invErr } = await context.supabase
      .from("inventory_units")
      .update({ status: "AVAILABLE" })
      .eq("status", "SOLD");
    if (invErr) throw new Error(invErr.message);

    const { error: itemsErr } = await context.supabase
      .from("bill_items")
      .delete()
      .not("id", "is", null);
    if (itemsErr) throw new Error(itemsErr.message);

    const { error } = await context.supabase
      .from("bills")
      .delete()
      .not("id", "is", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

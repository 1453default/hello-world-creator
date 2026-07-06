/**
 * GET /api/public/reservations/availability?unit=<uuid>
 *
 * Lightweight check: is this inventory unit currently reservable? Returns the
 * backend-computed advance amount so the UI can display it before starting the
 * flow. Never trusts a client-supplied amount downstream — this is display only.
 */
import { createFileRoute } from "@tanstack/react-router";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/public/reservations/availability")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const unit = url.searchParams.get("unit") ?? "";
        if (!/^[0-9a-f-]{36}$/i.test(unit)) {
          return json({ error: "invalid_unit" }, 400);
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data: u, error: uErr } = await (supabaseAdmin as any)
          .from("inventory_units")
          .select("id, status, product_id")
          .eq("id", unit)
          .maybeSingle();
        if (uErr) return json({ error: "lookup_failed" }, 500);
        if (!u) return json({ error: "not_found" }, 404);

        if (u.status !== "AVAILABLE") {
          return json({
            available: false,
            unit_status: u.status,
            reason:
              u.status === "RESERVATION_PENDING"
                ? "payment_in_progress"
                : u.status === "RESERVED"
                  ? "already_reserved"
                  : u.status === "SOLD"
                    ? "sold"
                    : "unavailable",
          });
        }

        const { data: product } = await (supabaseAdmin as any)
          .from("products")
          .select("selling_price, is_listed")
          .eq("id", u.product_id)
          .maybeSingle();

        if (!product || product.is_listed === false) {
          return json({ available: false, reason: "not_listed" });
        }

        const { data: amountRows } = await (supabaseAdmin.rpc as any)(
          "calc_reservation_amount",
          { _price: product.selling_price },
        );
        const amount =
          typeof amountRows === "number"
            ? amountRows
            : Number((amountRows as any)?.[0]?.calc_reservation_amount ?? 0);

        const { isPaymentConfigured } = await import(
          "@/lib/payments/index.server"
        );

        return json({
          available: true,
          payment_configured: isPaymentConfigured(),
          product_price: Number(product.selling_price),
          reservation_amount: Number(amount),
          balance_due: Number(product.selling_price) - Number(amount),
        });
      },
    },
  },
});

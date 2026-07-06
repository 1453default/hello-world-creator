/**
 * GET /api/public/reservations/status/:token
 *
 * Public reservation status by opaque `public_token` (48-hex). Returns a
 * minimal safe projection — no internal ids, no payment ids, no PII beyond
 * what the customer supplied themselves.
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

export const Route = createFileRoute("/api/public/reservations/status/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = String(params.token ?? "").trim();
        if (!/^[a-f0-9]{40,80}$/i.test(token)) {
          return json({ error: "invalid_token" }, 400);
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data, error } = await (supabaseAdmin as any)
          .from("reservations")
          .select(
            "reservation_number,status,product_price,reservation_amount,balance_due,hold_expires_at,reservation_expires_at,confirmed_at,cancelled_at,converted_at,customer_name,product_id",
          )
          .eq("public_token", token)
          .maybeSingle();

        if (error) return json({ error: "lookup_failed" }, 500);
        if (!data) return json({ error: "not_found" }, 404);

        return json({
          reservation: {
            number: data.reservation_number,
            status: data.status,
            product_price: Number(data.product_price),
            amount_paid: Number(data.reservation_amount),
            balance_due: Number(data.balance_due),
            hold_expires_at: data.hold_expires_at,
            reservation_expires_at: data.reservation_expires_at,
            confirmed_at: data.confirmed_at,
            cancelled_at: data.cancelled_at,
            converted_at: data.converted_at,
            customer_name: data.customer_name,
            product_id: data.product_id,
          },
        });
      },
    },
  },
});

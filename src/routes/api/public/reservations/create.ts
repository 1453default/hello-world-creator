/**
 * POST /api/public/reservations/create
 *
 * 1) Atomically creates an inventory hold via `create_reservation_hold`.
 * 2) Asks the active PaymentProvider to create an order (backend-computed
 *    amount — the frontend never dictates money).
 *
 * Returns 503 { error: "payment_not_configured" } when merchant credentials
 * aren't set yet, without leaving a dangling hold.
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  inventory_unit_id: z.string().uuid(),
  customer_name: z.string().min(2).max(120),
  customer_phone: z.string().min(8).max(20),
  customer_email: z.string().email().optional().or(z.literal("")).optional(),
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/reservations/create")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // ── validate ────────────────────────────────────────────────
        let parsed: z.infer<typeof bodySchema>;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch (err) {
          return json({ error: "Invalid request body", detail: String(err) }, 400);
        }

        // Fail fast if the payment provider isn't configured — do NOT open
        // a hold that no customer can pay for.
        const { isPaymentConfigured, getPaymentProvider, PaymentNotConfiguredError } =
          await import("@/lib/payments/index.server");
        if (!isPaymentConfigured()) {
          return json(
            {
              error: "payment_not_configured",
              message:
                "Online reservations are temporarily unavailable. Please try again later.",
            },
            503,
          );
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          null;
        const userAgent = request.headers.get("user-agent") ?? null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // ── 1) atomic hold ─────────────────────────────────────────
        const { data: reservation, error: holdError } = await (supabaseAdmin.rpc as any)(
          "create_reservation_hold",
          {
            _inventory_unit_id: parsed.inventory_unit_id,
            _customer_name: parsed.customer_name,
            _customer_phone: parsed.customer_phone,
            _customer_email: parsed.customer_email ?? null,
            _ip: ip,
            _user_agent: userAgent,
          },
        );

        if (holdError || !reservation) {
          const msg = holdError?.message ?? "Failed to create reservation hold";
          const isConflict = /unique_violation|not available|already have/i.test(msg);
          return json({ error: msg }, isConflict ? 409 : 400);
        }

        const res = reservation as {
          id: string;
          public_token: string;
          reservation_number: string;
          reservation_amount: number;
          product_price: number;
          balance_due: number;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
        };

        // ── 2) provider order ──────────────────────────────────────
        try {
          const provider = getPaymentProvider();
          const order = await provider.createOrder({
            reservationId: res.id,
            reservationNumber: res.reservation_number,
            amount: { amount: Number(res.reservation_amount), currency: "INR" },
            customer: {
              name: res.customer_name,
              phone: res.customer_phone,
              email: res.customer_email,
            },
          });

          await (supabaseAdmin.rpc as any)("attach_razorpay_order", {
            _reservation_id: res.id,
            _razorpay_order_id: order.providerOrderId,
          });

          return json({
            reservation: {
              id: res.id,
              token: res.public_token,
              number: res.reservation_number,
              amount: Number(res.reservation_amount),
              product_price: Number(res.product_price),
              balance_due: Number(res.balance_due),
            },
            payment: {
              provider: provider.name,
              key_id: order.publicKey,
              order_id: order.providerOrderId,
              amount: order.amount,
              currency: order.currency,
            },
            prefill: {
              name: res.customer_name,
              contact: res.customer_phone,
              email: res.customer_email ?? "",
            },
          });
        } catch (err) {
          // Roll back the hold so the unit is immediately available again.
          await (supabaseAdmin.rpc as any)("record_reservation_cancellation", {
            _reservation_id: res.id,
            _refund_amount: 0,
            _refund_id: null,
            _reason: "order_creation_failed",
            _actor: "system",
          });
          if (err instanceof PaymentNotConfiguredError) {
            return json({ error: "payment_not_configured", message: err.message }, 503);
          }
          console.error("Payment order failed", err);
          return json(
            { error: "Payment initialization failed. Please try again." },
            502,
          );
        }
      },
    },
  },
});

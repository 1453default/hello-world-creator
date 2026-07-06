/**
 * POST /api/public/reservations/create
 *
 * Body: { inventory_unit_id, customer_name, customer_phone, customer_email? }
 *
 * Creates an atomic reservation hold (unit → RESERVATION_PENDING) via the
 * SECURITY DEFINER Postgres function `create_reservation_hold`, then creates a
 * Razorpay order for the backend-computed amount. Amount is NEVER trusted
 * from the client.
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
        let parsed: z.infer<typeof bodySchema>;
        try {
          const raw = await request.json();
          parsed = bodySchema.parse(raw);
        } catch (err) {
          return json({ error: "Invalid request body", detail: String(err) }, 400);
        }

        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          null;
        const userAgent = request.headers.get("user-agent") ?? null;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // 1. Atomic hold
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

        // 2. Razorpay order
        try {
          const { createRazorpayOrder, getRazorpayKeyId } = await import(
            "@/lib/razorpay.server"
          );
          const amountPaise = Math.round(Number(res.reservation_amount) * 100);
          const order = await createRazorpayOrder({
            amountInPaise: amountPaise,
            receipt: res.reservation_number,
            notes: {
              reservation_id: res.id,
              reservation_number: res.reservation_number,
            },
          });

          await supabaseAdmin.rpc("attach_razorpay_order", {
            _reservation_id: res.id,
            _razorpay_order_id: order.id,
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
            razorpay: {
              key_id: getRazorpayKeyId(),
              order_id: order.id,
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
          // Rollback the hold if order creation fails.
          await supabaseAdmin.rpc("record_reservation_cancellation", {
            _reservation_id: res.id,
            _refund_amount: 0,
            _refund_id: null,
            _reason: "order_creation_failed",
            _actor: "system",
          });
          console.error("Razorpay order failed", err);
          return json(
            { error: "Payment initialization failed. Please try again." },
            502,
          );
        }
      },
    },
  },
});

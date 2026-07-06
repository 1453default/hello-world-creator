/**
 * POST /api/public/webhooks/razorpay
 *
 * Razorpay webhook receiver. Verifies HMAC signature over the raw body, then
 * upgrades matching reservations. Idempotent — dedupes on
 * `reservation_events.payload_hash` (SHA-256 of raw body).
 *
 * Events handled: payment.captured, payment.failed, refund.processed.
 */
import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "node:crypto";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/webhooks/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature") ?? "";

        const { verifyWebhookSignature } = await import("@/lib/razorpay.server");
        if (!verifyWebhookSignature(rawBody, signature)) {
          return json({ error: "invalid signature" }, 401);
        }

        let event: any;
        try {
          event = JSON.parse(rawBody);
        } catch {
          return json({ error: "invalid json" }, 400);
        }

        const payloadHash = createHash("sha256").update(rawBody).digest("hex");
        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // Idempotency: dedupe on payload_hash unique constraint.
        const { error: dedupeError } = await (supabaseAdmin as any)
          .from("reservation_events")
          .insert({
            event_type: "WEBHOOK_RECEIVED",
            actor: "razorpay",
            payload_hash: payloadHash,
            payload: { event_type: event?.event, id: event?.id },
          });
        if (dedupeError) {
          // Unique violation → already processed. Return 200 so Razorpay stops
          // retrying.
          if (String(dedupeError.code) === "23505") {
            return json({ status: "duplicate_ignored" });
          }
          console.error("webhook dedupe insert failed", dedupeError);
        }

        try {
          const type = event?.event as string;
          const payment = event?.payload?.payment?.entity;

          if (type === "payment.captured" && payment) {
            const orderId = payment.order_id;
            const paymentId = payment.id;
            if (!orderId || !paymentId) {
              return json({ status: "ignored", reason: "missing_ids" });
            }

            const { data: reservation } = await (supabaseAdmin as any)
              .from("reservations")
              .select("id")
              .eq("razorpay_order_id", orderId)
              .maybeSingle();
            if (!reservation) {
              return json({ status: "ignored", reason: "reservation_not_found" });
            }

            // Webhook signature is on the whole body — we've already verified.
            // Pass a placeholder for per-checkout signature so the DB fn accepts it.
            await (supabaseAdmin.rpc as any)("confirm_reservation", {
              _reservation_id: reservation.id,
              _razorpay_order_id: orderId,
              _razorpay_payment_id: paymentId,
              _razorpay_signature: `webhook:${payloadHash.slice(0, 16)}`,
            });
            return json({ status: "ok" });
          }

          if (type === "payment.failed" && payment) {
            const orderId = payment.order_id;
            if (!orderId) return json({ status: "ignored" });
            const { data: reservation } = await (supabaseAdmin as any)
              .from("reservations")
              .select("id, status")
              .eq("razorpay_order_id", orderId)
              .maybeSingle();
            if (reservation && reservation.status === "PENDING_PAYMENT") {
              await (supabaseAdmin.rpc as any)("record_reservation_cancellation", {
                _reservation_id: reservation.id,
                _refund_amount: 0,
                _refund_id: null,
                _reason: `razorpay_payment_failed:${payment.error_code ?? "unknown"}`,
                _actor: "razorpay",
              });
            }
            return json({ status: "ok" });
          }

          // refund.processed etc. are logged only; the refund UI records the
          // outcome via record_reservation_cancellation directly.
          return json({ status: "logged" });
        } catch (err) {
          console.error("razorpay webhook processing failed", err);
          // Still 200 so Razorpay doesn't retry endlessly; the audit row remains.
          return json({ status: "error_logged" });
        }
      },
    },
  },
});

/**
 * POST /api/public/webhooks/razorpay
 *
 * Provider-agnostic webhook receiver. Delegates signature/parse to the active
 * PaymentProvider. Idempotent via `reservation_events.payload_hash` unique
 * index. Always returns 200 after a valid signature so the provider stops
 * retrying — failures are recorded in the audit log.
 */
import { createFileRoute } from "@tanstack/react-router";

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

        const { isPaymentConfigured, getPaymentProvider } = await import(
          "@/lib/payments/index.server"
        );
        if (!isPaymentConfigured()) {
          // No secret to verify against yet — refuse rather than accept.
          return json({ error: "payment_not_configured" }, 503);
        }
        const provider = getPaymentProvider();
        const parsed = provider.parseWebhook(rawBody, request.headers);
        if (!parsed.ok) return json({ error: parsed.reason }, 401);

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // Idempotency insert
        const { error: dedupeError } = await (supabaseAdmin as any)
          .from("reservation_events")
          .insert({
            event_type: "WEBHOOK_RECEIVED",
            actor: "payment_provider",
            payload_hash: parsed.payloadHash,
            payload: { event_type: parsed.eventType, provider: provider.name },
          });
        if (dedupeError && String(dedupeError.code) === "23505") {
          return json({ status: "duplicate_ignored" });
        }
        if (dedupeError) {
          console.error("webhook dedupe insert failed", dedupeError);
        }

        try {
          if (parsed.eventType === "payment.captured") {
            if (!parsed.providerOrderId || !parsed.providerPaymentId) {
              return json({ status: "ignored", reason: "missing_ids" });
            }
            const { data: reservation } = await (supabaseAdmin as any)
              .from("reservations")
              .select("id")
              .eq("razorpay_order_id", parsed.providerOrderId)
              .maybeSingle();
            if (!reservation) {
              return json({ status: "ignored", reason: "reservation_not_found" });
            }
            await (supabaseAdmin.rpc as any)("confirm_reservation", {
              _reservation_id: reservation.id,
              _razorpay_order_id: parsed.providerOrderId,
              _razorpay_payment_id: parsed.providerPaymentId,
              _razorpay_signature: `webhook:${parsed.payloadHash.slice(0, 16)}`,
            });
            return json({ status: "ok" });
          }

          if (parsed.eventType === "payment.failed" && parsed.providerOrderId) {
            const { data: reservation } = await (supabaseAdmin as any)
              .from("reservations")
              .select("id, status")
              .eq("razorpay_order_id", parsed.providerOrderId)
              .maybeSingle();
            if (reservation && reservation.status === "PENDING_PAYMENT") {
              await (supabaseAdmin.rpc as any)("record_reservation_cancellation", {
                _reservation_id: reservation.id,
                _refund_amount: 0,
                _refund_id: null,
                _reason: `payment_failed:${parsed.errorCode ?? "unknown"}`,
                _actor: "payment_provider",
              });
            }
            return json({ status: "ok" });
          }

          return json({ status: "logged" });
        } catch (err) {
          console.error("webhook processing failed", err);
          return json({ status: "error_logged" });
        }
      },
    },
  },
});

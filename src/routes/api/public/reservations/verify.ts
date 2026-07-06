/**
 * POST /api/public/reservations/verify
 *
 * Called by the browser after Razorpay Checkout succeeds. Verifies the HMAC
 * signature, then upgrades the reservation to CONFIRMED. Idempotent —
 * webhook may have arrived first.
 *
 * Body: { reservation_id, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  reservation_id: z.string().uuid(),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/reservations/verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch (err) {
          return json({ error: "Invalid body", detail: String(err) }, 400);
        }

        const { verifyCheckoutSignature } = await import("@/lib/razorpay.server");
        if (
          !verifyCheckoutSignature({
            razorpay_order_id: body.razorpay_order_id,
            razorpay_payment_id: body.razorpay_payment_id,
            razorpay_signature: body.razorpay_signature,
          })
        ) {
          return json({ error: "Invalid payment signature" }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Sanity check: the reservation must own this order id.
        const { data: existing } = await (supabaseAdmin as any)
          .from("reservations")
          .select("id, public_token, razorpay_order_id")
          .eq("id", body.reservation_id)
          .maybeSingle();

        if (!existing || existing.razorpay_order_id !== body.razorpay_order_id) {
          return json({ error: "Reservation / order mismatch" }, 400);
        }

        const { data: confirmed, error } = await (supabaseAdmin.rpc as any)(
          "confirm_reservation",
          {
            _reservation_id: body.reservation_id,
            _razorpay_order_id: body.razorpay_order_id,
            _razorpay_payment_id: body.razorpay_payment_id,
            _razorpay_signature: body.razorpay_signature,
          },
        );

        if (error) return json({ error: error.message }, 500);

        return json({
          reservation: {
            id: (confirmed as any).id,
            token: (confirmed as any).public_token,
            number: (confirmed as any).reservation_number,
            status: (confirmed as any).status,
          },
        });
      },
    },
  },
});

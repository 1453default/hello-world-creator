/**
 * Reservation admin server functions. Staff-only via requireSupabaseAuth +
 * per-function `is_staff` check inside the SECURITY DEFINER Postgres
 * functions. Wire these into the admin UI in Phase 3.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const idInput = z.object({ reservation_id: z.string().uuid() });

/** List reservations with optional status filter (RLS: staff only). */
export const listReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { status?: string; limit?: number }) => data)
  .handler(async ({ data, context }) => {
    let q = (context.supabase as any)
      .from("reservations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(Math.min(data.limit ?? 100, 500));
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows as unknown[];
  });

/** Fetch a single reservation with its audit trail. */
export const getReservationDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idInput.parse(d))
  .handler(async ({ data, context }) => {
    const [{ data: reservation, error: rErr }, { data: events, error: eErr }] =
      await Promise.all([
        (context.supabase as any)
          .from("reservations")
          .select("*")
          .eq("id", data.reservation_id)
          .maybeSingle(),
        (context.supabase as any)
          .from("reservation_events")
          .select("*")
          .eq("reservation_id", data.reservation_id)
          .order("created_at", { ascending: false }),
      ]);
    if (rErr) throw new Error(rErr.message);
    if (eErr) throw new Error(eErr.message);
    return { reservation, events: events ?? [] };
  });

/** Check refund eligibility (50% within 24h). */
export const getRefundEligibility = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await (context.supabase.rpc as any)(
      "check_refund_eligibility",
      { _reservation_id: data.reservation_id },
    );
    if (error) throw new Error(error.message);
    return (rows as any[])?.[0] ?? { eligible: false, percent: 0, amount: 0, reason: "unknown" };
  });

/**
 * Cancel a reservation. If eligible for refund, hits the Razorpay refund API
 * first, then records the outcome. `force` allows manual override (staff).
 */
export const cancelReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        reservation_id: z.string().uuid(),
        reason: z.string().min(1).max(500),
        force_full_refund: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    // Verify caller is staff
    const { data: isStaff } = await (context.supabase.rpc as any)("is_staff", {
      _user_id: context.userId,
    });
    if (!isStaff) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: eligibilityRows } = await (supabaseAdmin.rpc as any)(
      "check_refund_eligibility",
      { _reservation_id: data.reservation_id },
    );
    const eligibility = (eligibilityRows as any[])?.[0] ?? {
      eligible: false,
      amount: 0,
    };

    const { data: reservation } = await (supabaseAdmin as any)
      .from("reservations")
      .select("razorpay_payment_id, status, reservation_amount")
      .eq("id", data.reservation_id)
      .maybeSingle();
    if (!reservation) throw new Error("Reservation not found");

    let refundAmount = 0;
    let refundId: string | null = null;

    const shouldRefund =
      data.force_full_refund || (eligibility.eligible && Number(eligibility.amount) > 0);
    if (shouldRefund && reservation.razorpay_payment_id) {
      const amt = data.force_full_refund
        ? Number(reservation.reservation_amount)
        : Number(eligibility.amount);
      const { createRazorpayRefund } = await import("@/lib/razorpay.server");
      const refund = await createRazorpayRefund({
        paymentId: reservation.razorpay_payment_id,
        amountInPaise: Math.round(amt * 100),
        notes: { reservation_id: data.reservation_id, reason: data.reason },
      });
      refundAmount = amt;
      refundId = refund.id;
    }

    const { data: updated, error } = await (supabaseAdmin.rpc as any)(
      "record_reservation_cancellation",
      {
        _reservation_id: data.reservation_id,
        _refund_amount: refundAmount,
        _refund_id: refundId,
        _reason: data.reason,
        _actor: `staff:${context.userId}`,
      },
    );
    if (error) throw new Error(error.message);
    return updated;
  });

/** Convert a CONFIRMED reservation into a bill (walk-in pickup). */
export const convertReservationToSale = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        reservation_id: z.string().uuid(),
        payment_method: z.string().min(1).max(40),
        discount: z.number().min(0).default(0),
        tax: z.number().min(0).default(0),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: bill, error } = await (context.supabase.rpc as any)(
      "convert_reservation_to_sale",
      {
        _reservation_id: data.reservation_id,
        _payment_method: data.payment_method,
        _discount: data.discount,
        _tax: data.tax,
      },
    );
    if (error) throw new Error(error.message);
    return bill;
  });

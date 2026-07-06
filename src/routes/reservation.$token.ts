/**
 * GET /reservation/:token
 *
 * Public advance-receipt page. Renders a printable HTML receipt when the
 * reservation is CONFIRMED. Uses the opaque public_token so we never expose
 * the internal reservation UUID.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/reservation/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = String(params.token ?? "").trim();
        if (!/^[a-f0-9]{40,80}$/i.test(token)) {
          return new Response("Invalid receipt link", {
            status: 400,
            headers: { "Content-Type": "text/plain" },
          });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const { data: reservation } = await (supabaseAdmin as any)
          .from("reservations")
          .select(
            "reservation_number,status,customer_name,customer_phone,customer_email,product_price,reservation_amount,balance_due,confirmed_at,reservation_expires_at,razorpay_payment_id,product_id",
          )
          .eq("public_token", token)
          .maybeSingle();

        if (!reservation) {
          return new Response("Reservation not found", {
            status: 404,
            headers: { "Content-Type": "text/plain" },
          });
        }

        if (
          reservation.status !== "CONFIRMED" &&
          reservation.status !== "CONVERTED"
        ) {
          return new Response(
            "This reservation is not confirmed yet or has been cancelled.",
            { status: 409, headers: { "Content-Type": "text/plain" } },
          );
        }

        const { data: product } = await (supabaseAdmin as any)
          .from("products")
          .select("title, brand:brands(name)")
          .eq("id", reservation.product_id)
          .maybeSingle();

        const { data: settings } = await (supabaseAdmin as any)
          .from("shop_settings")
          .select("key,value")
          .in("key", [
            "shop_name",
            "shop_tagline",
            "shop_address",
            "shop_phone",
            "shop_email",
            "shop_gstin",
          ]);

        const s: Record<string, string> = {};
        for (const row of (settings as any[]) ?? []) {
          if (row?.key && row?.value != null) s[row.key] = String(row.value);
        }

        const productTitle = product
          ? `${product.brand?.name ? product.brand.name + " " : ""}${product.title ?? ""}`.trim()
          : "Reserved Item";

        const { renderReservationReceipt } = await import(
          "@/lib/reservation-receipt"
        );

        const html = renderReservationReceipt({
          reservation_number: reservation.reservation_number,
          status: reservation.status,
          customer_name: reservation.customer_name,
          customer_phone: reservation.customer_phone,
          customer_email: reservation.customer_email,
          product_title: productTitle,
          product_price: Number(reservation.product_price),
          reservation_amount: Number(reservation.reservation_amount),
          balance_due: Number(reservation.balance_due),
          confirmed_at: reservation.confirmed_at,
          reservation_expires_at: reservation.reservation_expires_at,
          payment_reference: reservation.razorpay_payment_id,
          shop: {
            name: s.shop_name ?? "Used Mobiles",
            tagline: s.shop_tagline,
            address: s.shop_address,
            phone: s.shop_phone,
            email: s.shop_email,
            gstin: s.shop_gstin,
          },
        });

        return new Response(html, {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
            "X-Robots-Tag": "noindex, nofollow",
          },
        });
      },
    },
  },
});

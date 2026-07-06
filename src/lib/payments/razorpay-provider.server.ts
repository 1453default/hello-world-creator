/**
 * RazorpayProvider — concrete PaymentProvider backed by Razorpay Standard
 * Checkout. Loaded server-side only. Requires:
 *   RAZORPAY_KEY_ID
 *   RAZORPAY_KEY_SECRET
 *   RAZORPAY_WEBHOOK_SECRET
 */
import { createHash } from "node:crypto";
import {
  getRazorpayKeyId,
  createRazorpayOrder,
  createRazorpayRefund,
  verifyCheckoutSignature,
  verifyWebhookSignature,
} from "../razorpay.server";
import type {
  CreateOrderInput,
  PaymentOrder,
  PaymentProvider,
  PaymentRefund,
  RefundInput,
  VerifyPaymentInput,
  WebhookParseResult,
} from "./provider";

export const razorpayProvider: PaymentProvider = {
  name: "razorpay",

  getPublicKey() {
    return getRazorpayKeyId();
  },

  async createOrder(input: CreateOrderInput): Promise<PaymentOrder> {
    const order = await createRazorpayOrder({
      amountInPaise: Math.round(input.amount.amount * 100),
      receipt: input.reservationNumber,
      notes: {
        reservation_id: input.reservationId,
        reservation_number: input.reservationNumber,
        customer_name: input.customer.name,
        customer_phone: input.customer.phone,
        ...(input.notes ?? {}),
      },
    });
    return {
      providerOrderId: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      publicKey: getRazorpayKeyId(),
    };
  },

  verifyPayment(input: VerifyPaymentInput): boolean {
    return verifyCheckoutSignature({
      razorpay_order_id: input.providerOrderId,
      razorpay_payment_id: input.providerPaymentId,
      razorpay_signature: input.providerSignature,
    });
  },

  parseWebhook(rawBody: string, headers: Headers): WebhookParseResult {
    const signature = headers.get("x-razorpay-signature") ?? "";
    if (!verifyWebhookSignature(rawBody, signature)) {
      return { ok: false, reason: "invalid_signature" };
    }
    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return { ok: false, reason: "invalid_body" };
    }
    const payloadHash = createHash("sha256").update(rawBody).digest("hex");
    const payment = event?.payload?.payment?.entity ?? {};
    return {
      ok: true,
      eventType: String(event?.event ?? "unknown"),
      providerOrderId: payment.order_id ?? null,
      providerPaymentId: payment.id ?? null,
      raw: event,
      payloadHash,
      errorCode: payment.error_code ?? undefined,
    };
  },

  async refund(input: RefundInput): Promise<PaymentRefund> {
    const refund = await createRazorpayRefund({
      paymentId: input.providerPaymentId,
      amountInPaise: Math.round(input.amount.amount * 100),
      notes: input.notes,
    });
    return {
      providerRefundId: refund.id,
      amount: Number(refund.amount),
      status: refund.status,
    };
  },
};

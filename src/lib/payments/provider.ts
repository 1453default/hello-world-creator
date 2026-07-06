/**
 * PaymentProvider — abstract interface for reservation advance payments.
 *
 * All reservation code talks to this interface. The concrete Razorpay
 * implementation lives at `./razorpay-provider.server.ts`. Swapping providers
 * later (or adding a sandbox for tests) does not require touching route
 * handlers or DB code.
 */

export type Money = {
  /** Whole rupees (or provider-native primary unit). */
  amount: number;
  currency: "INR";
};

export type CreateOrderInput = {
  reservationId: string;
  reservationNumber: string;
  amount: Money;
  customer: {
    name: string;
    phone: string;
    email?: string | null;
  };
  notes?: Record<string, string>;
};

export type PaymentOrder = {
  providerOrderId: string;
  amount: number; // in smallest unit (paise for INR)
  currency: string;
  /** Public credential the browser needs to launch checkout (never a secret). */
  publicKey: string;
};

export type VerifyPaymentInput = {
  providerOrderId: string;
  providerPaymentId: string;
  providerSignature: string;
};

export type WebhookParseResult =
  | {
      ok: true;
      eventType: string;
      providerOrderId: string | null;
      providerPaymentId: string | null;
      raw: unknown;
      /** SHA-256 hex of the raw body — used for idempotency dedupe. */
      payloadHash: string;
      errorCode?: string;
    }
  | { ok: false; reason: "invalid_signature" | "invalid_body" };

export type RefundInput = {
  providerPaymentId: string;
  amount: Money;
  notes?: Record<string, string>;
};

export type PaymentRefund = {
  providerRefundId: string;
  amount: number; // paise
  status: string;
};

export interface PaymentProvider {
  readonly name: string;
  /** Returns the public/publishable key the browser uses to open checkout. */
  getPublicKey(): string;
  createOrder(input: CreateOrderInput): Promise<PaymentOrder>;
  /** Verifies HMAC signature of checkout callback. Pure — no network. */
  verifyPayment(input: VerifyPaymentInput): boolean;
  parseWebhook(rawBody: string, headers: Headers): WebhookParseResult;
  refund(input: RefundInput): Promise<PaymentRefund>;
}

/** Thrown when the provider isn't configured yet (credentials missing). */
export class PaymentNotConfiguredError extends Error {
  code = "payment_not_configured" as const;
  constructor(message = "Payment provider is not configured") {
    super(message);
    this.name = "PaymentNotConfiguredError";
  }
}

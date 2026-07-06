/**
 * Razorpay server-side helpers. NEVER imported from client bundles.
 * The `.server.ts` suffix is enforced by the client-side import guard.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const RAZORPAY_API = "https://api.razorpay.com/v1";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function getRazorpayKeyId(): string {
  return requireEnv("RAZORPAY_KEY_ID");
}

function basicAuth(): string {
  const id = requireEnv("RAZORPAY_KEY_ID");
  const secret = requireEnv("RAZORPAY_KEY_SECRET");
  return "Basic " + Buffer.from(`${id}:${secret}`).toString("base64");
}

/** Verify Razorpay checkout callback signature (order+payment). */
export function verifyCheckoutSignature(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const secret = requireEnv("RAZORPAY_KEY_SECRET");
  const body = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return safeEqualHex(expected, input.razorpay_signature);
}

/** Verify Razorpay webhook signature over the raw body. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = requireEnv("RAZORPAY_WEBHOOK_SECRET");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

function safeEqualHex(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt?: string;
};

/** Create a Razorpay order (amount is in paise). */
export async function createRazorpayOrder(input: {
  amountInPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: "POST",
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountInPaise,
      currency: "INR",
      receipt: input.receipt,
      payment_capture: 1,
      notes: input.notes ?? {},
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay order create failed [${res.status}]: ${text}`);
  }
  return (await res.json()) as RazorpayOrder;
}

export type RazorpayRefund = {
  id: string;
  amount: number;
  status: string;
  payment_id: string;
};

/** Trigger a Razorpay refund (full when amountInPaise omitted). */
export async function createRazorpayRefund(input: {
  paymentId: string;
  amountInPaise?: number;
  notes?: Record<string, string>;
  speed?: "normal" | "optimum";
}): Promise<RazorpayRefund> {
  const body: Record<string, unknown> = {
    speed: input.speed ?? "normal",
    notes: input.notes ?? {},
  };
  if (input.amountInPaise != null) body.amount = input.amountInPaise;

  const res = await fetch(`${RAZORPAY_API}/payments/${input.paymentId}/refund`, {
    method: "POST",
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay refund failed [${res.status}]: ${text}`);
  }
  return (await res.json()) as RazorpayRefund;
}

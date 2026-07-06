/**
 * Factory that returns the active PaymentProvider. Fails loudly with
 * PaymentNotConfiguredError when credentials aren't set yet — routes turn
 * that into a 503 so the rest of the reservation system can run without
 * blocking on merchant credentials.
 */
import { PaymentNotConfiguredError, type PaymentProvider } from "./provider";
import { razorpayProvider } from "./razorpay-provider.server";

export function isPaymentConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_WEBHOOK_SECRET,
  );
}

export function getPaymentProvider(): PaymentProvider {
  if (!isPaymentConfigured()) {
    throw new PaymentNotConfiguredError(
      "Razorpay credentials are not configured yet. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.",
    );
  }
  return razorpayProvider;
}

export { PaymentNotConfiguredError };
export type { PaymentProvider } from "./provider";

import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Section, Bullets } from "@/components/public/LegalPage";
import { SHOP_PHONE, SHOP_WHATSAPP_DISPLAY } from "@/lib/shop";

const UPDATED = "January 2026";
const CANONICAL = "https://usedmobiles.lovable.app/refund-policy";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy — USED MOBILES" },
      { name: "description", content: "Refund terms for reservation advances and in-store purchases at USED MOBILES, Hyderabad. Clear timelines, eligibility and how refunds are issued." },
      { property: "og:title", content: "Refund Policy — USED MOBILES" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Refund Policy"
      updated={UPDATED}
      intro="This policy explains when and how USED MOBILES issues refunds for reservation advances paid online and for purchases completed in-store. Please read it carefully before reserving a device."
    >
      <Section title="1. Reservation advance — overview">
        <p>
          USED MOBILES lets you reserve a specific pre-owned device by paying a small refundable
          advance online. The advance holds that exact unit for you for a limited period so you can
          visit the store, inspect it, and complete the purchase.
        </p>
      </Section>

      <Section title="2. When you are entitled to a full refund (100%)">
        <Bullets
          items={[
            "The device turns out to differ materially from the listing (wrong model, wrong storage, undisclosed major defect) when you inspect it in-store.",
            "We are unable to hand over the reserved device for any reason on our side (already sold, damaged during handling, etc.).",
            "Duplicate or accidental payment for the same reservation.",
            "The reservation is cancelled by us before you arrive.",
          ]}
        />
      </Section>

      <Section title="3. Partial refund (50%) — customer cancellation">
        <p>
          If you cancel your reservation before the hold period expires and none of the conditions
          in Section 2 apply, 50% of the advance is refunded and 50% is retained to cover the
          opportunity cost of holding the device off the shelf.
        </p>
      </Section>

      <Section title="4. No refund">
        <Bullets
          items={[
            "You do not visit the store within the reservation hold window and do not communicate with us.",
            "You attempt to cancel after the reservation has already been converted to a sale in-store.",
            "The advance was paid using unauthorised means and is subject to chargeback investigation.",
          ]}
        />
      </Section>

      <Section title="5. In-store purchases">
        <p>
          Once a device is billed and handed over in-store, the sale is treated as final. Post-sale
          issues are handled under the <b>Return Policy</b> and applicable warranty terms, not as
          refunds. Please inspect the device thoroughly before completing payment.
        </p>
      </Section>

      <Section title="6. Refund method & timelines">
        <Bullets
          items={[
            "Refunds are issued to the original payment source used for the reservation (UPI, card or netbanking).",
            "Once approved, refunds are initiated within 2 business days. The amount typically reflects in your account within 5–7 business days, depending on your bank / UPI provider.",
            "For cash-billed in-store transactions where a refund is authorised, refunds are issued via bank transfer to an account in the buyer's name.",
          ]}
        />
      </Section>

      <Section title="7. How to request a refund">
        <p>Contact us with your reservation reference and payment details:</p>
        <Bullets
          items={[
            <>Phone: {SHOP_PHONE}</>,
            <>WhatsApp: {SHOP_WHATSAPP_DISPLAY}</>,
            "In person at the store during business hours.",
          ]}
        />
      </Section>

      <Section title="8. Disputes">
        <p>
          If you disagree with a refund decision, please write to us within 7 days. Any dispute
          arising from this policy is subject to the jurisdiction of the courts of Hyderabad,
          Telangana.
        </p>
      </Section>
    </LegalPage>
  ),
});

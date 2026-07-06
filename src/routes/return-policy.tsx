import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Section, Bullets } from "@/components/public/LegalPage";
import { SHOP_PHONE, SHOP_WHATSAPP_DISPLAY } from "@/lib/shop";

const UPDATED = "January 2026";
const CANONICAL = "https://usedmobiles.lovable.app/return-policy";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return Policy — USED MOBILES" },
      { name: "description", content: "How returns, replacements and warranty claims work for pre-owned smartphones purchased from USED MOBILES, Hyderabad." },
      { property: "og:title", content: "Return Policy — USED MOBILES" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Return Policy"
      updated={UPDATED}
      intro="USED MOBILES sells pre-owned smartphones that are inspected, graded and demonstrated to the customer before purchase. This policy explains how returns, replacements and warranty claims are handled."
    >
      <Section title="1. Inspect before you pay">
        <p>
          Every device is fully tested and demonstrated at the counter — battery health, display,
          cameras, network, biometrics and accessories. We encourage you to spend as much time as
          you need before completing payment. Once the bill is generated and the device is handed
          over, the sale is treated as final.
        </p>
      </Section>

      <Section title="2. Return window (change of mind)">
        <p>
          We do not offer returns purely on the basis of change of mind, as pre-owned devices are
          hand-picked and priced individually. If you are unsure, please take the time to inspect
          before paying.
        </p>
      </Section>

      <Section title="3. Replacement — dead-on-arrival (7 days)">
        <p>Within <b>7 days of purchase</b>, we will replace or refund the device if:</p>
        <Bullets
          items={[
            "The device fails to power on or exhibits a critical hardware fault that was not disclosed at the time of sale.",
            "A functional issue disclosed as fixed is found to still be present.",
            "IMEI / serial number of the device does not match the bill.",
          ]}
        />
        <p>
          The device must be returned in the exact condition it was sold in, with the original bill,
          box (if provided) and accessories. Physical damage, liquid damage, unauthorised repair or
          tampering voids this cover.
        </p>
      </Section>

      <Section title="4. Warranty (where applicable)">
        <p>
          Eligible devices carry a store warranty (typically <b>3 to 6 months</b>, printed on your
          invoice) covering internal hardware faults that are not caused by the user. Warranty
          covers:
        </p>
        <Bullets
          items={[
            "Motherboard / logic-board failures.",
            "Display, speaker, mic, cameras and charging port failures not caused by physical damage.",
            "Battery drop-outs beyond normal wear (subject to inspection).",
          ]}
        />
        <p>Warranty does <b>not</b> cover:</p>
        <Bullets
          items={[
            "Physical, cosmetic or liquid damage.",
            "Software issues, iCloud / Google account lockouts caused by the customer, or unauthorised jailbreak / root.",
            "Accessories such as chargers, cables, cases and screen protectors.",
            "Any device opened or repaired outside our store.",
          ]}
        />
      </Section>

      <Section title="5. Devices purchased through exchange / buy-back">
        <p>
          Devices you sell or exchange with USED MOBILES cannot be reclaimed once the transaction
          is complete and the device has entered our inventory. Please remove all personal data,
          disable Find My / anti-theft locks and remove SIM/memory cards before handing over.
        </p>
      </Section>

      <Section title="6. Turn-around time">
        <Bullets
          items={[
            "Diagnostic inspection: same day, in most cases.",
            "In-house repair under warranty: 3–10 working days.",
            "Replacement subject to availability of an equivalent unit; if unavailable, a pro-rata refund is issued.",
          ]}
        />
      </Section>

      <Section title="7. How to raise a return or warranty claim">
        <p>
          Bring the device and the original bill to our store, or call {SHOP_PHONE} / WhatsApp{" "}
          {SHOP_WHATSAPP_DISPLAY} first so we can guide you. Claims cannot be processed without the
          original invoice.
        </p>
      </Section>
    </LegalPage>
  ),
});

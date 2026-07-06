import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Section } from "@/components/public/LegalPage";

const UPDATED = "January 2026";
const CANONICAL = "https://usedmobiles.lovable.app/disclaimer";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — USED MOBILES" },
      { name: "description", content: "Disclaimer covering product information, pricing, availability and third-party trademarks on the USED MOBILES website." },
      { property: "og:title", content: "Disclaimer — USED MOBILES" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Disclaimer"
      updated={UPDATED}
      intro="Please read this disclaimer carefully before using the USED MOBILES website. By using this site, you agree to the terms below."
    >
      <Section title="1. Pre-owned devices">
        <p>
          All smartphones listed on this website are <b>pre-owned</b> (second-hand or refurbished)
          unless explicitly marked otherwise. Cosmetic condition, battery health and included
          accessories vary from unit to unit and are described using our internal grading system
          (A++, A+, A, B, C). Photographs are representative; the exact device shown to you in-store
          is the one you buy.
        </p>
      </Section>

      <Section title="2. Product information & availability">
        <p>
          We make reasonable efforts to keep product information, prices and availability accurate,
          but errors can occur. Availability is real-time but not guaranteed until a device is
          reserved or billed in-store. USED MOBILES reserves the right to correct any error and to
          refuse or cancel an order or reservation caused by such an error, with a full refund of
          any advance paid.
        </p>
      </Section>

      <Section title="3. Not affiliated with brand manufacturers">
        <p>
          USED MOBILES is an independent retailer. We are not authorised by or affiliated with
          Apple Inc., Samsung Electronics, OnePlus, Xiaomi, Google, or any other brand whose
          products we resell. All trademarks, logos and brand names are the property of their
          respective owners and are used only to identify the products we sell.
        </p>
      </Section>

      <Section title="4. Warranty & after-sales">
        <p>
          Warranty (where offered) is a store warranty provided by USED MOBILES and is independent
          of any manufacturer warranty. Manufacturer warranty on pre-owned devices may be limited,
          void or non-transferable depending on the original purchase; we do not warrant that
          manufacturer support will be available on any device.
        </p>
      </Section>

      <Section title="5. External links & third-party services">
        <p>
          Our website may link to third-party websites and services (payment gateway, Google Maps,
          WhatsApp, Instagram, etc.). We are not responsible for the content, availability, privacy
          practices or terms of use of those third parties.
        </p>
      </Section>

      <Section title="6. No professional advice">
        <p>
          Content on this website is provided for general information only and does not constitute
          professional, legal, financial or technical advice. Please verify device suitability for
          your specific use case before purchase.
        </p>
      </Section>

      <Section title="7. Limitation of liability">
        <p>
          To the fullest extent permitted by law, USED MOBILES shall not be liable for any
          indirect, incidental, special or consequential loss (including loss of data, profit or
          business) arising out of the use of this website or of any device purchased from us,
          beyond the amount you paid for that device.
        </p>
      </Section>

      <Section title="8. Governing law">
        <p>
          This disclaimer is governed by the laws of India. Any dispute is subject to the
          exclusive jurisdiction of the courts of Hyderabad, Telangana.
        </p>
      </Section>
    </LegalPage>
  ),
});

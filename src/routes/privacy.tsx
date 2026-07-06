import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, Section, Bullets } from "@/components/public/LegalPage";
import { SHOP_ADDRESS, SHOP_PHONE, SHOP_WHATSAPP_DISPLAY } from "@/lib/shop";

const UPDATED = "January 2026";
const CANONICAL = "https://usedmobiles.lovable.app/privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — USED MOBILES" },
      { name: "description", content: "How USED MOBILES collects, uses and protects your personal information when you browse our website, reserve a device or visit our store in Hyderabad." },
      { property: "og:title", content: "Privacy Policy — USED MOBILES" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: () => (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated={UPDATED}
      intro="This Privacy Policy explains what information USED MOBILES collects, why we collect it, and the choices you have. It applies to our website, our reservation and payment flows, and any interaction you have with us at our store or over phone / WhatsApp."
    >
      <Section title="1. Who we are">
        <p>
          USED MOBILES ("we", "us", "our") is a retail store dealing in pre-owned smartphones,
          located at {SHOP_ADDRESS}. You can reach us on {SHOP_PHONE} or WhatsApp {SHOP_WHATSAPP_DISPLAY}.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <p>We only collect what we need to serve you. This can include:</p>
        <Bullets
          items={[
            <><b>Contact details</b> — name, phone number, email or WhatsApp number when you reserve a device, request a quote or contact us.</>,
            <><b>Reservation & payment data</b> — the product you reserved, advance amount, transaction reference and payment status. Payment card / UPI credentials are never seen or stored by us; they are handled directly by our payment gateway.</>,
            <><b>Device information</b> — for buy-back or exchange, the make, model, IMEI, physical condition and photographs of the device you offer to us.</>,
            <><b>Usage data</b> — basic analytics like pages viewed, device / browser type and approximate location, collected via cookies and standard server logs.</>,
          ]}
        />
      </Section>

      <Section title="3. How we use your information">
        <Bullets
          items={[
            "Processing reservations, advance payments, invoices and warranty records.",
            "Communicating about your order, exchange offer or service request (call, SMS, WhatsApp or email).",
            "Verifying identity and IMEI/ownership for devices we buy back.",
            "Preventing fraud, chargebacks and misuse of the reservation system.",
            "Meeting tax, GST and other legal obligations under Indian law.",
            "Improving the website and understanding which products customers are looking for.",
          ]}
        />
      </Section>

      <Section title="4. Sharing your information">
        <p>We do not sell your personal information. We share limited data only with:</p>
        <Bullets
          items={[
            <><b>Payment gateway</b> — to process reservation advances and refunds securely (e.g. name, phone, amount, order reference).</>,
            "Logistics or repair partners where a service explicitly requires it.",
            "Government / regulatory authorities when required by law.",
          ]}
        />
      </Section>

      <Section title="5. Cookies">
        <p>
          Our website uses a small number of cookies to keep you signed in (where applicable),
          remember preferences, and measure site performance. You can disable cookies in your
          browser; core browsing will still work, but some features may not.
        </p>
      </Section>

      <Section title="6. Data retention">
        <p>
          We retain transaction and invoice data for as long as required under applicable tax and
          accounting laws (typically 8 years for GST records). Reservation records that never
          convert to a sale are retained for a limited period for fraud prevention and analytics,
          and then anonymised or deleted.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          We use reasonable technical and organisational safeguards — encrypted connections (HTTPS),
          scoped database access, and PCI-compliant payment processing — to protect your
          information. No system is 100% secure, and you share information with us at your own risk.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>You may contact us to:</p>
        <Bullets
          items={[
            "Access the personal information we hold about you.",
            "Correct information that is inaccurate or outdated.",
            "Request deletion of information we are not legally required to keep.",
            "Opt out of promotional messages at any time.",
          ]}
        />
        <p>To exercise these rights, call {SHOP_PHONE} or write to us on WhatsApp.</p>
      </Section>

      <Section title="9. Children">
        <p>
          Our services are intended for customers aged 18 and above. We do not knowingly collect
          personal information from minors.
        </p>
      </Section>

      <Section title="10. Changes to this policy">
        <p>
          We may update this policy as our business and applicable laws evolve. The "Last updated"
          date at the top of this page will always reflect the current version.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          For anything privacy-related, contact USED MOBILES at {SHOP_ADDRESS}. Phone {SHOP_PHONE},
          WhatsApp {SHOP_WHATSAPP_DISPLAY}.
        </p>
      </Section>
    </LegalPage>
  ),
});

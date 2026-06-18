import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Clock, MessageCircle, Instagram } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import {
  SHOP_ADDRESS,
  SHOP_HOURS,
  SHOP_INSTAGRAM,
  SHOP_INSTAGRAM_HANDLE,
  SHOP_MAPS_URL,
  SHOP_PHONE,
  whatsappLink,
} from "@/lib/shop";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Visit USED MOBILES — Toli Chowki, Hyderabad" },
      {
        name: "description",
        content:
          "Visit USED MOBILES at Hyder Manzil, 7 Tombs Rd, Toli Chowki, Hyderabad. Call 090004 64640 or WhatsApp us.",
      },
      { property: "og:title", content: "Visit USED MOBILES — Hyderabad" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 pt-6 md:pt-12">
        <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">
          Visit our shop.
        </h1>
        <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-xl">
          Come in to see, test, and pick your phone in person. We're open all days of a week.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <a
            href={SHOP_MAPS_URL}
            target="_blank"
            rel="noopener"
            className="aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-muted relative group"
          >
            <iframe
              title="USED MOBILES location"
              src="https://www.google.com/maps?q=Used+Mobile+Hyder+Manzil+7+Tombs+Road+Toli+Chowki+Hyderabad+500008&output=embed"
              className="h-full w-full"
              loading="lazy"
            />
            <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-card/95 backdrop-blur p-3 text-sm font-semibold flex items-center gap-2 group-hover:bg-card transition">
              <MapPin className="h-4 w-4 text-primary" /> Open in Google Maps
            </div>
          </a>

          <div className="space-y-3">
            <InfoCard icon={<MapPin className="h-5 w-5" />} title="Address">
              {SHOP_ADDRESS}
            </InfoCard>
            <InfoCard icon={<Phone className="h-5 w-5" />} title="Phone">
              <a href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`} className="font-num text-foreground hover:text-primary">
                {SHOP_PHONE}
              </a>
            </InfoCard>
            <InfoCard icon={<Clock className="h-5 w-5" />} title="Hours">
              {SHOP_HOURS}
            </InfoCard>
            <InfoCard icon={<Instagram className="h-5 w-5" />} title="Instagram">
              <a href={SHOP_INSTAGRAM} target="_blank" rel="noopener" className="text-foreground hover:text-primary">
                {SHOP_INSTAGRAM_HANDLE}
              </a>
            </InfoCard>

            <a
              href={whatsappLink("Hi USED MOBILES! I'd like to enquire.")}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-whatsapp px-5 font-bold text-white hover:bg-whatsapp-dark transition"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp us
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </div>
        <div className="mt-0.5 text-sm text-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

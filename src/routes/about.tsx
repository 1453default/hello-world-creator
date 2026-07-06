import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ShieldCheck, BadgeCheck, Wrench, HandCoins, Repeat, Users, Sparkles, MapPin, Phone, MessageCircle } from "lucide-react";
import { SHOP_ADDRESS, SHOP_PHONE, whatsappLink } from "@/lib/shop";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About USED MOBILES — Trusted Pre-Owned Smartphones in Hyderabad" },
      {
        name: "description",
        content:
          "USED MOBILES is Hyderabad's trusted store for certified pre-owned smartphones. Buy, sell and exchange iPhone, Samsung, OnePlus and more with quality checks, fair pricing and warranty.",
      },
      { property: "og:title", content: "About USED MOBILES" },
      { property: "og:description", content: "Certified pre-owned smartphones with quality checks, warranty and fair pricing — in the heart of Hyderabad." },
      { property: "og:url", content: "https://usedmobiles.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://usedmobiles.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 pt-6 md:pt-14">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">About Us</div>
        <h1 className="mt-2 font-display text-3xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
          Pre-owned smartphones,<br className="hidden md:block" /> honestly done.
        </h1>
        <p className="mt-5 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
          USED MOBILES is a family-run store in Toli Chowki, Hyderabad. We buy, sell and exchange
          quality second-hand iPhone, Samsung, OnePlus, Xiaomi and other flagship phones — every
          device tested, graded and priced fairly, so you walk out confident.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat k="8+ yrs" v="Serving Hyderabad" />
          <Stat k="30-point" v="Quality inspection" />
          <Stat k="Warranty" v="On eligible devices" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 mt-16">
        <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">What we stand for</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card icon={<ShieldCheck className="h-5 w-5" />} title="Tested & graded">
            Every phone goes through a structured inspection — battery health, display, cameras,
            speakers, network, biometrics — and is assigned a transparent condition grade (A++ to C).
          </Card>
          <Card icon={<BadgeCheck className="h-5 w-5" />} title="Warranty where applicable">
            Eligible devices carry a shop warranty covering functional issues, so you're not on your
            own after the sale. Exact terms are shared before purchase.
          </Card>
          <Card icon={<HandCoins className="h-5 w-5" />} title="Genuine pricing">
            No inflated MRPs, no fake discounts. Prices reflect the real market value of the exact
            device and grade you're buying.
          </Card>
          <Card icon={<Wrench className="h-5 w-5" />} title="Refurbished, not repainted">
            We restore what matters and disclose what doesn't. No hidden repairs, no re-shelled units
            passed off as new.
          </Card>
          <Card icon={<Repeat className="h-5 w-5" />} title="Buy · Sell · Exchange">
            Upgrading? Bring your old phone. We offer instant valuations and let you exchange
            towards any device in the store.
          </Card>
          <Card icon={<Users className="h-5 w-5" />} title="Customer-first">
            Try before you buy. Ask anything. Walk out only when you're happy — that's the standard
            we've built our repeat customers on.
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 mt-16">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-10">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <div className="text-xs font-semibold uppercase tracking-widest">How we work</div>
          </div>
          <h2 className="mt-2 font-display text-2xl md:text-3xl font-extrabold tracking-tight">
            From listing to your hand — the process
          </h2>
          <ol className="mt-6 grid gap-6 md:grid-cols-4 counter-reset">
            {[
              { t: "Source", d: "We hand-pick devices from trusted individuals and channels — nothing anonymous." },
              { t: "Inspect", d: "A 30-point functional and cosmetic check assigns a grade (A++ to C)." },
              { t: "Restore", d: "Sanitising, software reset, battery replacement or spare where required." },
              { t: "List & sell", d: "Photographed honestly, priced fairly, and handed over in-store with warranty terms in writing." },
            ].map((s, i) => (
              <li key={s.t} className="relative rounded-2xl border border-border bg-background p-5">
                <div className="text-xs font-bold text-primary">STEP {i + 1}</div>
                <div className="mt-1 font-display text-lg font-bold text-foreground">{s.t}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 mt-16 mb-16">
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-card to-card border border-border p-6 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">Come see us in person</h2>
          <p className="mt-3 max-w-xl text-muted-foreground leading-relaxed">
            The best way to buy a pre-owned phone is to hold it, test it, and decide. Our doors are
            open every day — no appointment needed.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <a href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 font-semibold hover:border-primary transition">
              <Phone className="h-4 w-4 text-primary" /> Call us
            </a>
            <a href={whatsappLink("Hi USED MOBILES!")} target="_blank" rel="noopener" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-whatsapp px-4 font-semibold text-white hover:bg-whatsapp-dark transition">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <Link to="/contact" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:opacity-90 transition">
              <MapPin className="h-4 w-4" /> Directions
            </Link>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{SHOP_ADDRESS}</p>
        </div>
      </section>
    </PublicLayout>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="font-display text-2xl font-extrabold text-foreground">{k}</div>
      <div className="mt-1 text-sm text-muted-foreground">{v}</div>
    </div>
  );
}

function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 hover:border-primary/60 transition">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mt-3 font-display text-lg font-bold text-foreground">{title}</div>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

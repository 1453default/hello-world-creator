import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, Instagram } from "lucide-react";
import { SHOP_PHONE, SHOP_INSTAGRAM, SHOP_INSTAGRAM_HANDLE, whatsappLink } from "@/lib/shop";
import { Dock } from "@/components/public/Dock";
import { BrandTagline } from "@/components/public/BrandTagline";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <PublicHeader />
      <main
        className="flex-1"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 7rem)" }}
      >
        {children}
      </main>
      <PublicFooter />
      <Dock />
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <img src="/USED_MOBILE_LOGO.png" alt="USED MOBILES" className="h-12 w-12 md:h-14 md:w-14 shrink-0 object-contain" onError={(e) => ((e.currentTarget.style.display = "none"))} />
          <div className="min-w-0">
            <div className="font-display text-base font-extrabold leading-none tracking-tight text-foreground">
              USED MOBILES
            </div>
            <div className="mt-1.5">
              <BrandTagline />
            </div>
          </div>
        </Link>

        <nav className="hidden gap-1 md:flex">
          {[
            { to: "/", label: "Home" },
            { to: "/catalog", label: "Catalog" },
            { to: "/contact", label: "Contact" },
          ].map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "bg-accent text-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <a
          href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:border-primary transition"
          aria-label="Call shop"
        >
          <Phone className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline font-num">{SHOP_PHONE}</span>
        </a>
      </div>
    </header>
  );
}

function PublicFooter() {
  const explore: { to: "/" | "/catalog" | "/about" | "/contact"; label: string }[] = [
    { to: "/", label: "Home" },
    { to: "/catalog", label: "Catalog" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact Us" },
  ];
  const legal: { to: "/privacy" | "/refund-policy" | "/return-policy" | "/disclaimer"; label: string }[] = [
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/refund-policy", label: "Refund Policy" },
    { to: "/return-policy", label: "Return Policy" },
    { to: "/disclaimer", label: "Disclaimer" },
  ];

  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <img src="/USED_MOBILE_LOGO.png" alt="" className="h-9 w-9 object-contain" />
            <div className="min-w-0">
              <div className="font-display font-extrabold text-foreground">USED MOBILES</div>
              <div className="mt-1.5"><BrandTagline /></div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hyderabad's trusted destination for certified pre-owned smartphones.
            Buy · Sell · Exchange.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href={SHOP_INSTAGRAM} target="_blank" rel="noopener" aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`} aria-label="Call" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary transition">
              <Phone className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-foreground">Explore</h4>
          <ul className="space-y-2">
            {explore.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-foreground">Legal</h4>
          <ul className="space-y-2">
            {legal.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-widest mb-3 text-foreground">Visit</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hyder Manzil, 7 Tombs Rd, beside Al Ameen Meat Mart,
            <br />Samata Colony, Toli Chowki, Hyderabad 500008
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Open all days · 10:00 AM – 11:00 PM</p>
          <a href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`} className="mt-3 block text-sm font-semibold text-foreground hover:text-primary font-num">
            {SHOP_PHONE}
          </a>
          <a href={whatsappLink()} target="_blank" rel="noopener" className="block text-sm text-foreground hover:text-primary font-num">
            WhatsApp · {SHOP_PHONE}
          </a>
          <span className="sr-only">{SHOP_INSTAGRAM_HANDLE}</span>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground px-4">
        © {new Date().getFullYear()} USED MOBILES · Hyderabad · All rights reserved.
      </div>
    </footer>
  );
}


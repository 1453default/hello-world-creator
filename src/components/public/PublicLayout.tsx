import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, Instagram } from "lucide-react";
import logoAsset from "@/assets/used-mobiles-logo.png.asset.json";
import { SHOP_PHONE, SHOP_INSTAGRAM, SHOP_INSTAGRAM_HANDLE, whatsappLink } from "@/lib/shop";
import { Dock } from "@/components/public/Dock";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1 pb-28 md:pb-12">{children}</main>
      <PublicFooter />
      <Dock />
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src={logoAsset.url} alt="USED MOBILES" className="h-10 w-10 shrink-0 object-contain" />
          <div className="min-w-0">
            <div className="font-display text-base font-extrabold leading-none tracking-tight text-foreground">
              USED MOBILES
            </div>
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Buy · Trust
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
  return (
    <footer className="mt-12 border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <img src={logoAsset.url} alt="" className="h-9 w-9 object-contain" />
            <div>
              <div className="font-display font-extrabold text-foreground">USED MOBILES</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Buy · Trust</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hyderabad's trusted destination for certified pre-owned smartphones.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Visit Us</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hyder Manzil, 7 Tombs Rd, beside Al Ameen Meat Mart,
            <br />Samata Colony, Toli Chowki, Hyderabad 500008
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Mon–Sat: 10:00 AM – 8:00 PM</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Contact</h4>
          <a href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`} className="block text-sm text-foreground hover:text-primary font-num">
            {SHOP_PHONE}
          </a>
          <a href={whatsappLink()} target="_blank" rel="noopener" className="block text-sm text-foreground hover:text-primary font-num">
            WhatsApp · {SHOP_PHONE}
          </a>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} USED MOBILES · Hyderabad
      </div>
    </footer>
  );
}


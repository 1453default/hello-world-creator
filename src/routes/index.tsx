import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ArrowRight, Sparkles, ShieldCheck, MessageCircle, MapPin, ChevronRight, BadgeCheck, RotateCcw, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ProductCard } from "@/components/public/ProductCard";
import { RecentlySoldCard } from "@/components/public/RecentlySoldCard";
import { brandsQuery, allProductsQuery, recentlySoldQuery } from "@/lib/catalog";
import { whatsappLink } from "@/lib/shop";
import { InstagramReels } from "@/components/public/InstagramReels";
import { latestStockReels, testimonialReels } from "@/lib/instagram";
import heroMain from "@/assets/um-counter.jpg";
import heroEnt from "@/assets/um-ent.jpg";
import heroLeft from "@/assets/um-left.jpg";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "USED MOBILES — Certified Pre-Owned Smartphones in Hyderabad" },
      {
        name: "description",
        content:
          "Buy quality second-hand iPhone, Samsung, OnePlus, and more at USED MOBILES, Toli Chowki, Hyderabad. Tested, warranted, fairly priced.",
      },
      { property: "og:title", content: "USED MOBILES — Pre-Owned Smartphones, Hyderabad" },
      {
        property: "og:description",
        content: "Tested, warranted, fairly priced pre-owned phones. Visit us in Toli Chowki.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(brandsQuery),
      context.queryClient.ensureQueryData(allProductsQuery),
      context.queryClient.ensureQueryData(recentlySoldQuery),
    ]);
  },

  component: HomePage,
  errorComponent: ({ error }) => <ErrorPage message={error.message} />,
  notFoundComponent: () => <ErrorPage message="Page not found." />,
});

function ErrorPage({ message }: { message: string }) {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </PublicLayout>
  );
}

const BUDGET_BUCKETS = [
  { label: "Under ₹10K", max: 10000 },
  { label: "₹10K–20K", min: 10000, max: 20000 },
  { label: "₹20K–30K", min: 20000, max: 30000 },
  { label: "₹30K–50K", min: 30000, max: 50000 },
  { label: "₹50K+", min: 50000 },
];

function HomePage() {
  const { data: brands } = useSuspenseQuery(brandsQuery);
  const { data: products } = useSuspenseQuery(allProductsQuery);
  const { data: recentlySold } = useSuspenseQuery(recentlySoldQuery);

  const [activeBudget, setActiveBudget] = useState<number | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeBrand && p.brand?.slug !== activeBrand) return false;
      if (activeBudget != null) {
        const b = BUDGET_BUCKETS[activeBudget];
        if (b.min != null && p.selling_price < b.min) return false;
        if (b.max != null && p.selling_price >= b.max) return false;
      }
      return true;
    });
  }, [products, activeBudget, activeBrand]);

  const justIn = [...products]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 8);
  const BRAND_PRIORITY: Record<string, number> = {
    apple: 0,
    samsung: 1,
    oneplus: 2,
    nothing: 3,
    motorola: 4,
  };
  const featured = products
    .filter((p) => p.is_featured)
    .sort((a, b) => {
      const ra = BRAND_PRIORITY[a.brand?.name?.toLowerCase() ?? ""] ?? 99;
      const rb = BRAND_PRIORITY[b.brand?.name?.toLowerCase() ?? ""] ?? 99;
      if (ra !== rb) return ra - rb;
      return b.selling_price - a.selling_price;
    })
    .slice(0, 12);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber/5 via-background to-info/5" />
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-10 md:pt-16 md:pb-16">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
            {/* Left: Copy + Search */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald" /> Tested · Warranted · Fairly Priced
                </div>
                <h1 className="mt-4 font-display text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight text-foreground">
                  Pre-owned phones <br />
                  <span className="text-primary">Hyderabad trusts.</span>
                </h1>
                <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl">
                  Carefully refurbished iPhone, Samsung, OnePlus & more — at honest prices, with a
                  warranty. Visit our Toli Chowki store or chat on WhatsApp.
                </p>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                action="/search"
                className="mt-6 flex h-14 max-w-xl items-center gap-2 rounded-2xl border border-border bg-card pl-4 pr-2 shadow-sm focus-within:border-primary transition"
              >
                <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search iPhone 13, Galaxy S23, OnePlus…"
                  className="flex-1 min-w-0 bg-transparent outline-none text-[15px] placeholder:text-muted-foreground"
                />
                <button className="h-10 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-amber-dark transition">
                  Search
                </button>
              </motion.form>
            </div>

            {/* Right: Store showcase — 1 large + 2 supporting */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="relative"
            >
              <div className="grid grid-cols-5 grid-rows-2 gap-3 h-[380px] sm:h-[440px] md:h-[500px]">
                {/* Main hero image */}
                <figure className="relative col-span-3 row-span-2 overflow-hidden rounded-2xl border border-border bg-muted shadow-xl">
                  <img
                    src={heroMain}
                    alt="USED MOBILES store counter with premium pre-owned smartphones on display"
                    className="h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent p-4">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-ink">
                      <MapPin className="h-3 w-3 text-primary" /> Toli Chowki · Hyderabad
                    </div>
                  </div>
                </figure>

                {/* Supporting top */}
                <figure className="relative col-span-2 row-span-1 overflow-hidden rounded-2xl border border-border bg-muted shadow-md">
                  <img
                    src={heroEnt}
                    alt="USED MOBILES store interior with Samsung counter and accessory display"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>

                {/* Supporting bottom */}
                <figure className="relative col-span-2 row-span-1 overflow-hidden rounded-2xl border border-border bg-muted shadow-md">
                  <img
                    src={heroLeft}
                    alt="Side view of USED MOBILES shop showing organized phone accessory wall"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute right-2 bottom-2 rounded-full bg-emerald/95 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                    ● Open Today
                  </div>
                </figure>
              </div>

              {/* Decorative glow */}
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-amber/10 via-transparent to-info/10 blur-2xl" />
            </motion.div>
          </div>
        </div>
      </section>


      {/* Brand chips */}
      <section className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveBrand(null)}
              className={`chip ${activeBrand === null ? "chip-active" : ""}`}
            >
              All brands
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBrand(activeBrand === b.slug ? null : b.slug)}
                className={`chip ${activeBrand === b.slug ? "chip-active" : ""}`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Budget chips */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Shop by budget
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {BUDGET_BUCKETS.map((b, i) => (
              <button
                key={b.label}
                onClick={() => setActiveBudget(activeBudget === i ? null : i)}
                className={`chip ${activeBudget === i ? "chip-active" : ""}`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filtered results when filter active */}
      {(activeBrand || activeBudget != null) && (
        <section className="mx-auto max-w-6xl px-4 pt-8">
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-display text-xl font-bold">
              {filtered.length} {filtered.length === 1 ? "phone" : "phones"} match
            </h2>
            <button
              onClick={() => {
                setActiveBrand(null);
                setActiveBudget(null);
              }}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {!activeBrand && activeBudget == null && (
        <>
          {/* Just In */}
          <ProductRow
            title="Just In"
            subtitle="Freshly listed this week"
            icon={<Sparkles className="h-4 w-4 text-primary" />}
            products={justIn}
          />

          {/* Featured */}
          {featured.length > 0 && (
            <ProductRow
              title="Featured Phones"
              subtitle="Hand-picked by our team"
              products={featured}
            />
          )}

          {/* Browse by brand */}
          <section className="mx-auto max-w-6xl px-4 mt-12">
            <h2 className="font-display text-2xl font-bold mb-1">Browse by brand</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Tap a brand to see every model we have in stock
            </p>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {brands.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                >
                  <Link
                    to="/brand/$slug"
                    params={{ slug: b.slug }}
                    className="flex aspect-square flex-col items-center justify-center rounded-xl border border-border bg-card font-display font-bold text-foreground hover:border-primary hover:bg-accent transition text-center px-2"
                  >
                    <span className="text-sm md:text-base">{b.name}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Recently Sold — social proof */}
          {recentlySold.length > 0 && (
            <section className="mx-auto max-w-6xl px-4 mt-12">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                    Live activity
                  </div>
                  <h2 className="font-display text-2xl font-bold mt-1">🔥 Recently Sold</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    These devices were recently purchased by our customers.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {recentlySold.map((p, i) => (
                  <RecentlySoldCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}


          {/* Happy Customers (Instagram) */}
          <InstagramReels
            title="⭐ Happy Customers"
            subtitle="Real customers. Real purchases. Real experiences."
            urls={testimonialReels}
            showCta
            ctaLabel="View More Customer Stories"
          />

          {/* Stock Reels (Instagram) */}
          <InstagramReels
            title="🎥 Stock Reels"
            subtitle="Watch our latest phone arrivals, demos and stock updates directly from Instagram."
            urls={latestStockReels}
            showCta
            ctaLabel="Explore More Stock"
          />


          {/* WhatsApp CTA */}
          <section className="mx-auto max-w-6xl px-4 mt-12 mb-4">
            <div className="rounded-2xl bg-ink text-white p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="font-display text-2xl md:text-3xl font-extrabold leading-tight">
                  Have a specific phone in mind?
                </h3>
                <p className="mt-2 text-sm md:text-base text-white/70 max-w-md">
                  Tell us what you're looking for. We'll WhatsApp you when it's in stock.
                </p>
              </div>
              <a
                href={whatsappLink("Hi USED MOBILES, I'm looking for…")}
                target="_blank"
                rel="noopener"
                className="relative z-10 inline-flex h-12 items-center gap-2 rounded-full bg-whatsapp px-6 font-bold text-white hover:bg-whatsapp-dark transition shrink-0"
              >
                <MessageCircle className="h-5 w-5" /> Chat with us
              </a>
              <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-amber/20 blur-3xl" />
            </div>
          </section>
        </>
      )}
    </PublicLayout>
  );
}

function ProductRow({
  title,
  subtitle,
  icon,
  products,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  products: ReturnType<typeof Array<any>>;
}) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 mt-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {icon} {subtitle}
          </div>
          <h2 className="font-display text-2xl font-bold mt-1">{title}</h2>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {products.slice(0, 12).map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}

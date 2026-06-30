import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, MessageCircle, Phone, ShieldCheck, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ProductCard } from "@/components/public/ProductCard";
import { allProductsQuery, productBySlugQuery } from "@/lib/catalog";
import { SHOP_PHONE, conditionLabel, formatINR, whatsappLink } from "@/lib/shop";
import { useState } from "react";

export const Route = createFileRoute("/phone/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — USED MOBILES` },
      { name: "description", content: "Pre-owned smartphone in stock at USED MOBILES Hyderabad." },
    ],
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(productBySlugQuery(params.slug));
    await context.queryClient.ensureQueryData(allProductsQuery);
  },
  component: PhoneDetail,
  errorComponent: ({ error }) => (
    <PublicLayout>
      <div className="p-10 text-center text-muted-foreground">{error.message}</div>
    </PublicLayout>
  ),
  notFoundComponent: () => (
    <PublicLayout>
      <div className="p-10 text-center text-muted-foreground">Phone not found.</div>
    </PublicLayout>
  ),
});

function PhoneDetail() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productBySlugQuery(slug)) as any;
  const { data: allProducts } = useSuspenseQuery(allProductsQuery);
  if (!product) throw notFound();
  const sold = product.available_count === 0;
  const [activeImg, setActiveImg] = useState(0);
  const images = product.images?.length ? product.images : [];
  const similar = allProducts
    .filter((p) => p.id !== product.id && p.brand?.slug === product.brand?.slug)
    .slice(0, 4);

  const enquire = whatsappLink(
    `Hi USED MOBILES! I'm interested in the *${product.brand?.name ?? ""} ${product.name}* — ${product.storage ?? ""}, ${product.color ?? ""}. Is it still available?`,
  );

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 pt-4 md:pt-8">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back to catalog
        </Link>

        <div className="mt-4 grid gap-6 md:grid-cols-[1.1fr_1fr] md:gap-10">
          {/* Gallery */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted"
            >
              {images[activeImg]?.url ? (
                <img
                  src={images[activeImg].url}
                  alt={product.name}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Smartphone className="h-24 w-24 opacity-20" strokeWidth={1.25} />
                </div>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                {images.map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      i === activeImg ? "border-primary" : "border-border"
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/brand/$slug"
                params={{ slug: product.brand?.slug ?? "" }}
                className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-foreground"
              >
                {product.brand?.name}
              </Link>
              <span className="rounded-full bg-card border border-border px-3 py-1 text-xs font-semibold text-foreground">
                {conditionLabel[product.condition] ?? product.condition}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  sold ? "status-sold" : "status-available"
                }`}
              >
                {sold ? "Sold Out" : `${product.available_count} in stock`}
              </span>
            </div>

            <h1 className="mt-3 font-display text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <div className="font-num text-4xl font-extrabold text-primary">
                {formatINR(product.selling_price)}
              </div>
              <span className="text-xs text-muted-foreground">Final price · taxes incl.</span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {product.storage && <Spec label="Storage" value={product.storage} />}
              {product.ram && <Spec label="RAM" value={product.ram} />}
              {product.color && <Spec label="Color" value={product.color} />}
            </div>

            {product.description && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2">About this phone</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-border bg-card p-4 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold">Inspected & warranted</div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Every device is tested for battery, display, cameras, and charging before listing.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2">
              <a
                href={enquire}
                target="_blank"
                rel="noopener"
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-whatsapp px-5 font-bold text-white hover:bg-whatsapp-dark transition"
              >
                <MessageCircle className="h-5 w-5" /> Enquire on WhatsApp
              </a>
              <a
                href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-5 font-bold text-foreground hover:border-primary transition"
              >
                <Phone className="h-5 w-5" /> Call shop
              </a>
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-4">More {product.brand?.name} phones</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {similar.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

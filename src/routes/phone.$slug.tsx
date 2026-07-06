import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageCircle, Phone, ShieldCheck, Smartphone } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ProductCard } from "@/components/public/ProductCard";
import { useSignedImageUrl } from "@/hooks/useSignedImageUrl";
import { allProductsQuery, productBySlugQuery } from "@/lib/catalog";
import { SHOP_PHONE, conditionLabel, formatINR, whatsappLink } from "@/lib/shop";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/phone/$slug")({
  loader: async ({ context, params }) => {
    const product = await context.queryClient.ensureQueryData(
      productBySlugQuery(params.slug),
    );
    await context.queryClient.ensureQueryData(allProductsQuery);
    return { product };
  },
  head: ({ loaderData }) => {
    const p: any = loaderData?.product;
    if (!p) {
      return {
        meta: [
          { title: "Phone — USED MOBILES" },
          { name: "description", content: "Pre-owned smartphone in stock at USED MOBILES Hyderabad." },
        ],
      };
    }
    const brand = p.brand?.name ? `${p.brand.name} ` : "";
    const title = `${brand}${p.name} — ₹${Math.round(Number(p.selling_price)).toLocaleString("en-IN")} | USED MOBILES`;
    const desc = `${brand}${p.name}${p.storage ? ` ${p.storage}` : ""}${p.color ? `, ${p.color}` : ""} · ${conditionLabel[p.condition] ?? p.condition} · Tested & warranted at USED MOBILES, Hyderabad.`;
    const image = p.images?.[0]?.url;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: desc },
      { property: "og:type", content: "product" },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
    ];

    if (image && /^https?:\/\//i.test(image)) {
      meta.push(
        { property: "og:image", content: image },
        { name: "twitter:image", content: image },
      );
    }
    return { meta };
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
            <Gallery
              images={images}
              activeImg={activeImg}
              setActiveImg={setActiveImg}
              productName={product.name}
            />
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

            <h1 className="mt-3 font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <div className="font-num text-3xl sm:text-4xl font-extrabold text-primary">
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

function ProductThumbnail({ src }: { src: string }) {
  const signedSrc = useSignedImageUrl(src);
  if (!signedSrc) return null;
  return <img src={signedSrc} alt="" className="h-full w-full object-contain p-1" />;
}

function Gallery({
  images,
  activeImg,
  setActiveImg,
  productName,
}: {
  images: any[];
  activeImg: number;
  setActiveImg: (i: number) => void;
  productName: string;
}) {
  const activeImageUrl = useSignedImageUrl(images[activeImg]?.url);
  const count = images.length;
  const hasMany = count > 1;
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const go = (delta: number) => {
    if (!hasMany) return;
    setDirection(delta);
    setActiveImg((activeImg + delta + count) % count);
  };

  useEffect(() => {
    if (!hasMany) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeImg, hasMany, count]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-muted select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          {activeImageUrl ? (
            <motion.img
              key={activeImg}
              src={activeImageUrl}
              alt={productName}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 40 : direction < 0 ? -40 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute inset-0 h-full w-full object-contain p-4"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <Smartphone className="h-24 w-24 opacity-20" strokeWidth={1.25} />
            </div>
          )}
        </AnimatePresence>

        {hasMany && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 md:h-11 md:w-11 place-items-center rounded-full bg-background/70 backdrop-blur-md border border-border/70 shadow-md text-foreground hover:bg-background hover:border-primary hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 md:h-11 md:w-11 place-items-center rounded-full bg-background/70 backdrop-blur-md border border-border/70 shadow-md text-foreground hover:bg-background hover:border-primary hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-background/70 backdrop-blur-md border border-border/70 px-2.5 py-1.5">
              {images.map((_: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  onClick={() => {
                    setDirection(i > activeImg ? 1 : -1);
                    setActiveImg(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeImg ? "w-5 bg-primary" : "w-1.5 bg-foreground/30 hover:bg-foreground/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasMany && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((img: any, i: number) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > activeImg ? 1 : -1);
                setActiveImg(i);
              }}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === activeImg ? "border-primary" : "border-border hover:border-primary/50"
              }`}
              aria-label={`Show image ${i + 1}`}
            >
              <ProductThumbnail src={img.url} />
            </button>
          ))}
        </div>
      )}
    </>
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

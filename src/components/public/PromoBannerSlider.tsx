import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { bannerImageRef, type PromoBanner } from "@/lib/banners";
import { useSignedImageUrl } from "@/hooks/useSignedImageUrl";

type Props = {
  banners: PromoBanner[];
  autoplayMs?: number;
  className?: string;
};

/**
 * Premium promotional banner carousel.
 * - Signs storage URLs client-side (no dependency on SSR image proxy — works on Vercel)
 * - Auto-play, infinite loop, swipe, arrows, dots, pause-on-hover, keyboard nav
 */
export function PromoBannerSlider({ banners, autoplayMs = 5500, className = "" }: Props) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const count = banners.length;
  const touchStartX = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const next = useCallback(() => setIndex((i) => (i + 1) % Math.max(1, count)), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + Math.max(1, count)) % Math.max(1, count)), [count]);

  useEffect(() => {
    if (count <= 1 || hovered) return;
    const id = window.setInterval(next, autoplayMs);
    return () => window.clearInterval(id);
  }, [count, hovered, next, autoplayMs]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  };

  if (count === 0) return null;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional banners"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
        touchStartX.current = null;
      }}
      className={`group relative w-full h-full overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-2xl ring-1 ring-ink/5 outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      <AnimatePresence initial={false} mode="wait">
        <BannerSlide key={banners[index].id} banner={banners[index]} index={index} count={count} />
      </AnimatePresence>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={prev}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-full bg-white/85 text-ink shadow-lg backdrop-blur-md ring-1 ring-white/60 hover:bg-white hover:scale-105 active:scale-95 transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={next}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-full bg-white/85 text-ink shadow-lg backdrop-blur-md ring-1 ring-white/60 hover:bg-white hover:scale-105 active:scale-95 transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-3 sm:bottom-4 z-10 flex justify-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? "w-8 bg-white shadow-md" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BannerSlide({ banner, index, count }: { banner: PromoBanner; index: number; count: number }) {
  const src = useSignedImageUrl(bannerImageRef(banner.image_path));
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.01 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}`}
    >
      {/* Skeleton shimmer while image loads */}
      {!loaded && !failed && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-accent to-muted" />
      )}

      {src && !failed && (
        <img
          src={src}
          alt={banner.heading ?? "Promotional banner"}
          className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}

      {/* Fallback gradient panel if image fails */}
      {failed && (
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink/90 to-primary/40" />
      )}

      {/* Premium multi-stop overlay — always readable, never washes out image */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent" />

      {(banner.heading || banner.subheading || (banner.button_text && banner.button_link)) && (
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl"
          >
            {banner.heading && (
              <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
                {banner.heading}
              </h3>
            )}
            {banner.subheading && (
              <p className="mt-2 sm:mt-3 text-sm sm:text-base md:text-lg text-white/90 max-w-md line-clamp-2 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]">
                {banner.subheading}
              </p>
            )}
            {banner.button_text && banner.button_link && (
              <a
                href={banner.button_link}
                className="group/cta mt-4 sm:mt-5 inline-flex h-11 sm:h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm sm:text-base font-bold text-primary-foreground shadow-[0_10px_30px_-8px_rgba(245,158,11,0.55)] hover:shadow-[0_14px_36px_-8px_rgba(245,158,11,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition"
              >
                {banner.button_text}
                <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
              </a>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bannerImageUrl, type PromoBanner } from "@/lib/banners";

type Props = {
  banners: PromoBanner[];
  autoplayMs?: number;
  className?: string;
};

/**
 * Premium promotional banner carousel.
 * - Auto-play with infinite loop
 * - Touch/swipe support
 * - Prev/Next arrows + dot pagination
 * - Pause on hover (desktop)
 * - Keyboard arrow-key navigation when focused
 * - Fills its container height; images use object-cover (never stretched)
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
  const banner = banners[index];

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
      className={`relative w-full h-full overflow-hidden rounded-2xl border border-border bg-muted shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}`}
        >
          <img
            src={bannerImageUrl(banner.image_path)}
            alt={banner.heading ?? "Promotional banner"}
            className="h-full w-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
          />
          {/* Readability overlay — always subtle so real images shine */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />

          {(banner.heading || banner.subheading || (banner.button_text && banner.button_link)) && (
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 md:p-8">
              <div className="max-w-lg">
                {banner.heading && (
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight text-white drop-shadow-md">
                    {banner.heading}
                  </h3>
                )}
                {banner.subheading && (
                  <p className="mt-1.5 text-xs sm:text-sm md:text-base text-white/85 max-w-md line-clamp-2">
                    {banner.subheading}
                  </p>
                )}
                {banner.button_text && banner.button_link && (
                  <a
                    href={banner.button_link}
                    className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-lg hover:bg-amber-dark transition"
                  >
                    {banner.button_text}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={prev}
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/85 text-ink shadow-md backdrop-blur hover:bg-white transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={next}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-white/85 text-ink shadow-md backdrop-blur hover:bg-white transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-2 sm:bottom-3 z-10 flex justify-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to banner ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/60 hover:bg-white/90"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import { type RecentlySoldCard as R } from "@/lib/catalog";
import { conditionLabel } from "@/lib/shop";

function relativeSold(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  const min = Math.floor(diffSec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (diffSec < 60) return "Sold just now";
  if (min < 60) return `Sold ${min} minute${min === 1 ? "" : "s"} ago`;
  if (hr < 24) return `Sold ${hr} hour${hr === 1 ? "" : "s"} ago`;
  if (day === 1) return "Sold yesterday";
  if (day < 7) return `Sold ${day} days ago`;
  if (day < 14) return "Sold last week";
  const weeks = Math.floor(day / 7);
  return `Sold ${weeks} week${weeks === 1 ? "" : "s"} ago`;
}

export function RecentlySoldCard({ product, index = 0 }: { product: R; index?: number }) {
  const img = product.images[0]?.url;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:border-red-500/50 transition"
    >
      <Link
        to="/phone/$slug"
        params={{ slug: product.slug }}
        className="block aspect-[3/4] relative bg-muted overflow-hidden"
      >
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            decoding="async"
            width={400}
            height={533}
            className="h-full w-full object-contain p-2 grayscale-[35%] transition duration-300 group-hover:scale-105"
            onError={(e) => {
              const t = e.currentTarget;
              t.style.display = "none";
              const fb = t.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="flex h-full w-full items-center justify-center text-muted-foreground"
          style={{ display: img ? "none" : "flex" }}
        >
          <Smartphone className="h-12 w-12 opacity-30" strokeWidth={1.25} />
        </div>
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="rounded-md border border-black/10 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm">
            {conditionLabel[product.condition] ?? product.condition}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Sold
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brand?.name}
          </div>
          <Link
            to="/phone/$slug"
            params={{ slug: product.slug }}
            className="font-display text-[15px] font-bold text-foreground leading-tight line-clamp-1 hover:text-red-600 transition"
          >
            {product.name}
          </Link>
        </div>
        <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
          {product.storage && <span>{product.storage}</span>}
          {product.ram && <span>· {product.ram} RAM</span>}
          {product.color && <span>· {product.color}</span>}
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600">
          <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
          {relativeSold(product.sold_at)}
        </div>
      </div>
    </motion.div>
  );
}

import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import { type ProductCard as P } from "@/lib/catalog";
import { conditionLabel, formatINR, whatsappLink } from "@/lib/shop";

export function ProductCard({ product, index = 0 }: { product: P; index?: number }) {
  const img = product.images[0]?.url;
  const sold = product.available_count === 0;
  const enquire = whatsappLink(
    `Hi, I'd like to enquire about the ${product.brand?.name ?? ""} ${product.name} (${product.storage ?? ""}, ${product.color ?? ""}).`,
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card hover:border-primary/50 transition"
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
            className="h-full w-full object-contain p-2 transition duration-300 group-hover:scale-105"
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
          {product.is_featured && (
            <span className="rounded-md bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
              Featured
            </span>
          )}
        </div>
        <div className="absolute bottom-2 right-2">
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              sold ? "status-sold" : "status-available"
            }`}
          >
            {sold ? "Sold Out" : `${product.available_count} in stock`}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {product.brand?.name}
            </div>
            <Link
              to="/phone/$slug"
              params={{ slug: product.slug }}
              className="font-display text-[15px] font-bold text-foreground leading-tight line-clamp-1 hover:text-primary transition"
            >
              {product.name}
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
          {product.storage && <span>{product.storage}</span>}
          {product.ram && <span>· {product.ram} RAM</span>}
          {product.color && <span>· {product.color}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="font-num text-lg font-bold text-foreground">
            {formatINR(product.selling_price)}
          </div>
          <a
            href={enquire}
            target="_blank"
            rel="noopener"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-whatsapp px-3 text-xs font-semibold text-white hover:bg-whatsapp-dark transition"
          >
            Enquire
          </a>
        </div>
      </div>
    </motion.div>
  );
}

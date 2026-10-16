import { cn } from "@/lib/utils";

type Tone = "default" | "print";

/**
 * Premium brand tagline: BUY — SELL — EXCHANGE
 * Editorial styling: uppercase display, wide tracking, hairline amber rules
 * as separators. Uses existing theme tokens only (primary/amber + foreground).
 */
export function BrandTagline({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: Tone;
}) {
  const textCls = tone === "print" ? "text-neutral-700" : "text-foreground/75";
  const ruleCls = tone === "print" ? "bg-amber-500/80" : "bg-primary/70";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-display text-[10px] font-semibold uppercase leading-none tracking-[0.32em]",
        textCls,
        className,
      )}
      aria-label="Buy, Sell, Exchange"
    >
      <span>Buy</span>
      <span aria-hidden="true" className={cn("h-px w-2.5 shrink-0", ruleCls)} />
      <span>Sell</span>
      <span aria-hidden="true" className={cn("h-px w-2.5 shrink-0", ruleCls)} />
      <span>Exchange</span>
    </span>
  );
}

import { cn } from "@/lib/utils";

type Tone = "default" | "muted" | "print";

export function BrandTagline({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: Tone;
}) {
  const textCls =
    tone === "print"
      ? "text-neutral-800"
      : tone === "muted"
      ? "text-muted-foreground"
      : "text-foreground/90";
  const dotCls = tone === "print" ? "bg-amber-500" : "bg-primary";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-display text-[10px] font-bold uppercase leading-none tracking-[0.28em]",
        textCls,
        className,
      )}
      aria-label="Buy, Sell, Exchange"
    >
      <span>Buy</span>
      <span
        aria-hidden="true"
        className={cn("h-[3px] w-[3px] shrink-0 rounded-full", dotCls)}
      />
      <span>Sell</span>
      <span
        aria-hidden="true"
        className={cn("h-[3px] w-[3px] shrink-0 rounded-full", dotCls)}
      />
      <span className={tone === "print" ? "text-amber-600" : "text-primary"}>
        Exchange
      </span>
    </span>
  );
}

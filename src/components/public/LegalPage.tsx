import { type ReactNode } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow?: string;
  title: string;
  updated?: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 pt-6 md:pt-12 print:pt-4">
        <header className="border-b border-border pb-6">
          {eyebrow ? (
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">
              {eyebrow}
            </div>
          ) : null}
          <h1 className="mt-2 font-display text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          {updated ? (
            <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
          ) : null}
          {intro ? (
            <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
              {intro}
            </p>
          ) : null}
        </header>

        <div className="legal-prose mt-8 pb-16 space-y-8 text-[15px] leading-relaxed text-foreground/90">
          {children}
        </div>
      </article>
    </PublicLayout>
  );
}

export function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="mt-2 space-y-2 list-disc pl-5 marker:text-primary">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

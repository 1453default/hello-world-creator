import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { z } from "zod";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ProductCard } from "@/components/public/ProductCard";
import { allProductsQuery } from "@/lib/catalog";
import { parseSearchQuery, priceMatches, priceRelevanceCompare } from "@/lib/price-search";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/search")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Search phones — USED MOBILES" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allProductsQuery),
  component: SearchPage,
  errorComponent: ({ error }) => (
    <PublicLayout>
      <div className="p-10 text-center text-muted-foreground">{error.message}</div>
    </PublicLayout>
  ),
  notFoundComponent: () => (
    <PublicLayout>
      <div className="p-10 text-center text-muted-foreground">Page not found.</div>
    </PublicLayout>
  ),
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data: products } = useSuspenseQuery(allProductsQuery);
  const [query, setQuery] = useState(q);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return products; // empty query → show all
    return products.filter((p) => {
      const hay = `${p.name} ${p.brand?.name ?? ""} ${p.storage ?? ""} ${p.color ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [products, query]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 pt-6 md:pt-10">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Search</h1>
        <div className="mt-4 flex h-14 items-center gap-2 rounded-2xl border border-border bg-card pl-4 pr-2 focus-within:border-primary transition">
          <SearchIcon className="h-5 w-5 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="iPhone 13, Samsung S23, OnePlus…"
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-md px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {query.trim()
            ? `${results.length} ${results.length === 1 ? "result" : "results"} for "${query}"`
            : `Showing all ${results.length} phones in stock.`}
        </p>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {results.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}

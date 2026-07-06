import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Search as SearchIcon, PackageSearch } from "lucide-react";
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

/**
 * Normalize a search string for matching.
 * - lowercase
 * - strip punctuation (keeps letters, digits, spaces)
 * - insert space between letter/digit boundaries ("iphone12" → "iphone 12")
 * - collapse whitespace
 */
function normalize(input: string): string {
  return (input ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/([a-z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function SearchPage() {
  const { q } = Route.useSearch();
  const { data: products } = useSuspenseQuery(allProductsQuery);
  const [query, setQuery] = useState(q);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return products;

    const { text, price } = parseSearchQuery(query);
    const normalizedText = normalize(text);
    const terms = normalizedText.split(/\s+/).filter(Boolean);

    const filtered = products.filter((p) => {
      if (!priceMatches(p.selling_price, price)) return false;
      if (terms.length === 0) return price.kind !== "none";
      const hay = normalize(
        `${p.name} ${p.brand?.name ?? ""} ${p.storage ?? ""} ${p.ram ?? ""} ${p.color ?? ""}`,
      );
      // Every term must appear as a whole token/substring in normalized hay.
      return terms.every((t) => hay.includes(t));
    });

    if (price.kind === "exact") return [...filtered].sort(priceRelevanceCompare(price));
    return filtered;
  }, [products, query]);

  const trimmedQuery = query.trim();
  const isEmpty = trimmedQuery.length > 0 && results.length === 0;

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
          {trimmedQuery
            ? `${results.length} ${results.length === 1 ? "result" : "results"} for "${query}"`
            : `Showing all ${results.length} phones in stock.`}
        </p>

        {isEmpty ? (
          <EmptyState query={trimmedQuery} onClear={() => setQuery("")} />
        ) : (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {results.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted">
        <PackageSearch className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="mt-4 font-display text-xl font-bold">No matching phones found</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We couldn't find anything for{" "}
        <span className="font-semibold text-foreground">"{query}"</span>. Try a different
        model name, or explore our full catalog.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onClear}
          className="h-10 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground hover:border-primary transition"
        >
          Clear search
        </button>
        <Link
          to="/catalog"
          className="h-10 inline-flex items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-amber-dark transition"
        >
          Browse all phones
        </Link>
      </div>
    </div>
  );
}


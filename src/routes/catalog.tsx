import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ProductCard } from "@/components/public/ProductCard";
import { allProductsQuery, brandsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — All Pre-Owned Phones | USED MOBILES" },
      {
        name: "description",
        content:
          "Browse every certified pre-owned smartphone in stock at USED MOBILES Hyderabad. Filter by brand, price, and condition.",
      },
      { property: "og:title", content: "Phone Catalog — USED MOBILES" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(allProductsQuery),
      context.queryClient.ensureQueryData(brandsQuery),
    ]);
  },
  component: CatalogPage,
  errorComponent: ({ error }) => (
    <PublicLayout>
      <div className="p-10 text-center text-muted-foreground">{error.message}</div>
    </PublicLayout>
  ),
  notFoundComponent: () => (
    <PublicLayout>
      <div className="p-10 text-center text-muted-foreground">No products found.</div>
    </PublicLayout>
  ),
});

type Sort = "default" | "newest" | "price_asc" | "price_desc";

function CatalogPage() {
  const { data: products } = useSuspenseQuery(allProductsQuery);
  const { data: brands } = useSuspenseQuery(brandsQuery);
  const [brand, setBrand] = useState<string | null>(null);
  const [condition, setCondition] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("default");

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (brand && p.brand?.slug !== brand) return false;
      if (condition && p.condition !== condition) return false;
      return true;
    });
    if (sort === "price_asc") list = [...list].sort((a, b) => a.selling_price - b.selling_price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.selling_price - a.selling_price);
    else if (sort === "newest")
      list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    // "default" → keep query's global ordering (brand → price desc → newest)
    return list;
  }, [products, brand, condition, sort]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 pt-6 md:pt-10">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight">All Phones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} listings · updated daily
        </p>

        {/* Filters */}
        <div className="mt-6 space-y-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setBrand(null)}
              className={`chip ${brand === null ? "chip-active" : ""}`}
            >
              All brands
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => setBrand(brand === b.slug ? null : b.slug)}
                className={`chip ${brand === b.slug ? "chip-active" : ""}`}
              >
                {b.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["like_new", "good", "fair"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCondition(condition === c ? null : c)}
                className={`chip ${condition === c ? "chip-active" : ""}`}
              >
                {c === "like_new" ? "Like New" : c[0].toUpperCase() + c.slice(1)}
              </button>
            ))}
            <div className="ml-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-9 rounded-full border border-border bg-card px-3 text-sm font-medium text-foreground focus:border-primary outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 mb-10 text-center">
            <p className="text-muted-foreground">No phones match your filters.</p>
            <button
              onClick={() => {
                setBrand(null);
                setCondition(null);
              }}
              className="mt-4 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-amber-dark transition"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

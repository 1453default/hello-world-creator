import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { ProductCard } from "@/components/public/ProductCard";
import { allProductsQuery, brandsQuery } from "@/lib/catalog";

export const Route = createFileRoute("/brand/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" ");
    return {
      meta: [
        { title: `${name} Phones — USED MOBILES Hyderabad` },
        { name: "description", content: `Pre-owned ${name} smartphones in stock at USED MOBILES.` },
        { property: "og:title", content: `${name} — Pre-Owned at USED MOBILES` },
      ],
    };
  },
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(brandsQuery),
      context.queryClient.ensureQueryData(allProductsQuery),
    ]);
  },
  component: BrandPage,
  errorComponent: ({ error }) => (
    <PublicLayout>
      <div className="p-10 text-center text-muted-foreground">{error.message}</div>
    </PublicLayout>
  ),
  notFoundComponent: () => (
    <PublicLayout>
      <div className="p-10 text-center text-muted-foreground">Brand not found.</div>
    </PublicLayout>
  ),
});

function BrandPage() {
  const { slug } = Route.useParams();
  const { data: brands } = useSuspenseQuery(brandsQuery);
  const { data: products } = useSuspenseQuery(allProductsQuery);
  const brand = brands.find((b) => b.slug === slug);
  if (!brand) throw notFound();
  const list = products.filter((p) => p.brand?.slug === slug);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 pt-6 md:pt-10">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> All phones
        </Link>
        <h1 className="mt-3 font-display text-3xl md:text-4xl font-extrabold tracking-tight">
          {brand.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {list.length} {list.length === 1 ? "listing" : "listings"} available
        </p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-16 text-center text-muted-foreground">
            No {brand.name} phones in stock right now. Check back soon.
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

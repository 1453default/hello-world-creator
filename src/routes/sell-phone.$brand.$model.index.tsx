import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MessageCircle, Phone } from "lucide-react";
import { PublicLayout } from "@/components/public/PublicLayout";
import { Crumbs, PhoneImg } from "@/components/sell/SellParts";
import { getSellBrand, getSellModel } from "@/data/sellPhoneCatalog";
import { SHOP_PHONE, whatsappLink } from "@/lib/shop";

export const Route = createFileRoute("/sell-phone/$brand/$model")({
  loader: ({ params }) => {
    const m = getSellModel(params.brand, params.model);
    if (!m) throw notFound();
    return { name: m.name };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Model not found" }, { name: "robots", content: "noindex" }] };
    const t = `Sell ${loaderData.name} — USED MOBILES`;
    const d = `Sell your used ${loaderData.name} to USED MOBILES, Hyderabad. Get in touch for an offer.`;
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Model not found</h1>
        <Link to="/sell-phone" className="mt-4 inline-block text-primary underline">Back to all brands</Link>
      </div>
    </PublicLayout>
  ),
  component: ModelPage,
});

function ModelPage() {
  const { brand: bslug, model: mslug } = Route.useParams();
  const brand = getSellBrand(bslug)!;
  const model = getSellModel(bslug, mslug)!;
  const msg = `Hi, I want to sell my ${model.name}.`;
  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 pt-6 pb-16 md:pt-10">
        <Crumbs
          items={[
            { label: "Sell Phone", to: "/sell-phone" },
            { label: brand.name, to: "/sell-phone/$brand", params: { brand: brand.slug } },
            { label: model.name },
          ]}
        />
        <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center">
          <div className="flex aspect-square items-center justify-center rounded-3xl border border-border bg-card p-8">
            <PhoneImg src={model.images[0]} alt={model.name} eager className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">{model.series !== "Other" ? model.series : brand.name}</div>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-extrabold tracking-tight">Sell your {model.name}</h1>
            <p className="mt-3 text-muted-foreground">
              Instant online valuation is coming soon. For now, message or call us with your phone's condition and we'll share an offer.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={whatsappLink(msg)} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground hover:opacity-90">
                <MessageCircle className="h-4 w-4" /> Get offer on WhatsApp
              </a>
              <a href={`tel:${SHOP_PHONE.replace(/\s/g, "")}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 font-semibold hover:border-primary">
                <Phone className="h-4 w-4 text-primary" /> Call us
              </a>
            </div>
            <Link to="/sell-phone/$brand" params={{ brand: brand.slug }} className="mt-6 inline-block text-sm text-primary underline">
              Choose a different {brand.name} model
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

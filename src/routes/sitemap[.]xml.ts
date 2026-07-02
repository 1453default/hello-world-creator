import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://usedmobiles.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const staticEntries: { path: string; changefreq: string; priority: string }[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/catalog", changefreq: "daily", priority: "0.9" },
          { path: "/contact", changefreq: "monthly", priority: "0.6" },
        ];

        const dynamicEntries: { path: string; lastmod?: string }[] = [];

        try {
          const { data: brands } = await supabaseAdmin
            .from("brands")
            .select("slug, updated_at")
            .eq("is_active", true);
          for (const b of brands ?? []) {
            dynamicEntries.push({ path: `/brand/${b.slug}`, lastmod: b.updated_at ?? undefined });
          }
        } catch {}

        try {
          const { data: products } = await supabaseAdmin
            .from("products")
            .select("slug, updated_at")
            .eq("is_listed", true);
          for (const p of products ?? []) {
            dynamicEntries.push({ path: `/phone/${p.slug}`, lastmod: p.updated_at ?? undefined });
          }
        } catch {}

        const all = [
          ...staticEntries.map((e) => ({ ...e, lastmod: undefined as string | undefined })),
          ...dynamicEntries.map((e) => ({ ...e, changefreq: "weekly", priority: "0.7" })),
        ];

        const urls = all.map((e) =>
          [
            "  <url>",
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
            `    <changefreq>${e.changefreq}</changefreq>`,
            `    <priority>${e.priority}</priority>`,
            "  </url>",
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls,
          "</urlset>",
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

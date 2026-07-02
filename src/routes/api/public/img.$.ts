import { createFileRoute } from "@tanstack/react-router";

/**
 * Stable public image proxy:  /api/public/img/<bucket>/<path...>
 * Redirects to a freshly-signed Supabase Storage URL.
 *
 * Why: signed URLs contain a token+timestamp and differ between SSR and client
 * render (breaks React hydration) and expire (breaks production over time).
 * A stable proxy URL is safe to embed in HTML, cache in the browser, and
 * dehydrate through React Query without drift.
 */
export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = params._splat ?? "";
        const [bucket, ...rest] = splat.split("/");
        const path = rest.join("/");
        if (!bucket || !path) {
          return new Response("Bad request", { status: 400 });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );
        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .createSignedUrl(path, 60 * 60); // 1 hour
        if (error || !data?.signedUrl) {
          return new Response("Not found", { status: 404 });
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: data.signedUrl,
            // Browsers + CDN can reuse the redirect for ~10 min. Well under
            // the signed-URL TTL so followed URLs stay valid.
            "Cache-Control": "public, max-age=600, s-maxage=600",
          },
        });
      },
    },
  },
});

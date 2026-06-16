import { createFileRoute } from "@tanstack/react-router";

// Public image proxy for private Supabase Storage buckets.
// URL shape: /api/public/img/<bucket>/<path...>
// Streams the object via service role; safe because we only allow whitelisted buckets.
const ALLOWED_BUCKETS = new Set(["product-images"]);

export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = (params as any)._splat ?? "";
        const [bucket, ...rest] = splat.split("/");
        if (!bucket || !ALLOWED_BUCKETS.has(bucket) || rest.length === 0) {
          return new Response("Not found", { status: 404 });
        }
        const path = rest.join("/");
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.storage.from(bucket).download(path);
          if (error || !data) return new Response("Not found", { status: 404 });
          const ct = (data as Blob).type || "image/jpeg";
          return new Response(data, {
            status: 200,
            headers: {
              "Content-Type": ct,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        } catch (e) {
          return new Response("Server error", { status: 500 });
        }
      },
    },
  },
});

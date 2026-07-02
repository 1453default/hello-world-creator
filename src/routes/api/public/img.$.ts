import { createFileRoute } from "@tanstack/react-router";

/**
 * Stable public image proxy:  /api/public/img/<bucket>/<path...>
 *
 * Streams the object bytes back to the client (no redirect). Reasons:
 *  - Signed URLs contain a token+expiry; a client-visible redirect target can
 *    expire between the redirect being cached and the image being requested,
 *    which manifests as broken images on mobile browsers that don't cache 302s
 *    the way desktop Chrome does (iOS Safari, Samsung Internet).
 *  - Some mobile carriers/proxies mangle cross-origin image redirect chains.
 *  - Same-origin streaming lets us set a strong immutable cache header safely:
 *    the storage path includes a unique timestamp so content never changes at
 *    a given URL.
 */
export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const splat = params._splat ?? "";
        const [bucket, ...rest] = splat.split("/");
        const path = rest.join("/");
        if (!bucket || !path) {
          return new Response("Bad request", { status: 400 });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // Short-lived signed URL used only server-side to fetch the bytes.
        const { data, error } = await supabaseAdmin.storage
          .from(bucket)
          .createSignedUrl(path, 60);
        if (error || !data?.signedUrl) {
          return new Response("Not found", { status: 404 });
        }

        const upstream = await fetch(data.signedUrl);

        if (!upstream.ok || !upstream.body) {
          return new Response("Not found", { status: 404 });
        }

        // Guess content type from extension when upstream is generic.
        const ext = path.split(".").pop()?.toLowerCase() ?? "";
        const extMime: Record<string, string> = {
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          png: "image/png",
          webp: "image/webp",
          avif: "image/avif",
          gif: "image/gif",
          svg: "image/svg+xml",
        };
        const upstreamType = upstream.headers.get("content-type") ?? "";
        const contentType =
          upstreamType && !upstreamType.startsWith("application/octet-stream")
            ? upstreamType
            : extMime[ext] ?? "image/jpeg";

        // Buffer the upstream body fully. Streaming through the Worker/edge
        // runtime and forwarding upstream Content-Length caused mobile
        // browsers (iOS Safari, Chrome Android) to abort loads when the
        // transport re-chunked or byte counts drifted vs. the forwarded
        // header. Buffering guarantees a byte-accurate Content-Length and a
        // complete response body across every mobile carrier / proxy.
        const bytes = await upstream.arrayBuffer();

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        headers.set("Content-Length", String(bytes.byteLength));
        // Storage paths embed a unique timestamp; content at a given URL
        // never changes, so it's safe to cache aggressively and immutably.
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("X-Content-Type-Options", "nosniff");

        return new Response(bytes, { status: 200, headers });

      },
    },
  },
});

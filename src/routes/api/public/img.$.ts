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

        // Forward conditional headers so browsers can 304 on revalidation.
        const upstreamHeaders: HeadersInit = {};
        const ifNoneMatch = request.headers.get("if-none-match");
        const ifModifiedSince = request.headers.get("if-modified-since");
        if (ifNoneMatch) (upstreamHeaders as Record<string, string>)["if-none-match"] = ifNoneMatch;
        if (ifModifiedSince)
          (upstreamHeaders as Record<string, string>)["if-modified-since"] = ifModifiedSince;

        const upstream = await fetch(data.signedUrl, { headers: upstreamHeaders });

        if (upstream.status === 304) {
          return new Response(null, {
            status: 304,
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }

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

        const headers = new Headers();
        headers.set("Content-Type", contentType);
        // Storage paths embed a unique timestamp; content at a given URL never
        // changes, so it's safe to cache aggressively and immutably.
        headers.set("Cache-Control", "public, max-age=31536000, immutable");
        const etag = upstream.headers.get("etag");
        if (etag) headers.set("ETag", etag);
        const lastModified = upstream.headers.get("last-modified");
        if (lastModified) headers.set("Last-Modified", lastModified);
        const contentLength = upstream.headers.get("content-length");
        if (contentLength) headers.set("Content-Length", contentLength);
        // Allow being embedded from any Lovable/Vercel/custom domain host.
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("X-Content-Type-Options", "nosniff");

        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});

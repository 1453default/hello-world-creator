# Deploying Used Mobiles

The recommended target is **Lovable Cloud** — the project is preconfigured for
Cloudflare Workers via `@lovable.dev/vite-tanstack-config`, runs the SSR
server-route handlers (image proxy, admin bootstrap, receipts) out of the box,
and integrates with the database/storage already wired in.

## Vercel / Netlify

This repo ships with `vercel.json` and `netlify.toml` for static-asset
deployment + SPA fallback. To deploy on those platforms with full SSR + server
routes (recommended), additionally:

1. Install a Nitro adapter for the target platform:
   - Vercel: `bun add -d nitropack` and set `NITRO_PRESET=vercel` in env.
   - Netlify: `NITRO_PRESET=netlify`.
2. Run `vite build`. Nitro emits the platform-specific output under `.output/`.
3. Add the following environment variables in the host dashboard:
   `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
   `VITE_SUPABASE_PROJECT_ID`, `LOVABLE_API_KEY`.

Without the adapter, the SPA fallback in `vercel.json` / `netlify.toml` keeps
the public catalog usable but **disables** the image proxy and the admin
bootstrap endpoint, so production deployments outside Lovable Cloud should
always include the Nitro adapter step above.

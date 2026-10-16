# Sell Your Phone — USED MOBILES (Website 2)

Standalone site where customers pick brand → model → storage/RAM variant and see the
"Get up to" price, then hand off to WhatsApp ("Check Exact Value") for a condition-based quote.

## Stack
TanStack Start v1 (React 19, file routes in `src/routes`), Vite 8, Tailwind CSS v4
(`src/styles.css`), Nitro for the server build. No database, no auth, no secrets.

## Commands
```bash
npm ci            # install from package-lock.json
npm run dev       # http://localhost:3000
npm run build     # production build -> .output/
npm run preview   # serve the build
npm run typecheck
```
`src/routeTree.gen.ts` is regenerated automatically by the router plugin.

## Structure
- `src/routes/` — `/` landing page, `/sell-phone`, `/sell-phone/$brand`, `/sell-phone/$brand/$model`, `/sell-phone/$brand/$model/$variant`
- `src/components/public/` — header, footer, dock (copied from Website 1, same look)
- `src/components/sell/SellParts.tsx` — breadcrumbs, search box, phone image
- `src/data/sellPhoneCatalog.generated.json` + `sellPhoneCatalog.ts` — brands, models, image paths
- `src/data/dofyPriceCatalog.generated.json` + `sellPhonePricing.ts` — the only price source (exact brand + model + storage/RAM match). Filename kept for compatibility.
- `public/sell-phone/logos/*.webp`, `public/sell-phone/phones/<brand>/<model>.webp` — local catalog images
- `public/about-device-questions/P1–P5/` — images for the future condition questionnaire
- `reference/AboutDeviceQuestions/` — P1–P5 reference HTML + images (not served, not used as pages)
- `reference/source-catalog/` — UM_2 metadata (PRODUCT_DATA JSON, model list), `dofy_cache/`, price research CSV
- `scripts/` — catalog maintenance scripts (Python 3 + Pillow); run from this folder's root

## Environment
Only optional `VITE_MAIN_SITE_URL` (Website 1 address used for Buy Phones / About / Contact / legal links;
defaults to https://usedmobiles.lovable.app). See `.env.example`.

## Catalog maintenance (careful)
- `scripts/import-sell-phone.py` rebuilds `sellPhoneCatalog.generated.json` and images from `reference/source-catalog/UM_2`.
  The raw UM_2 images/HTML (~425 MB) were **not** copied; copy `UM_2/` from Website 1 into `reference/source-catalog/UM_2/` before running it.
- `generate_dofy_dataset.py` and `apply_price_markup.py` **overwrite prices**. Do not run them unless you intend to change prices.
- `audit_data.py`, `check_matching.py`, `brand_stats.py`, `inspect_all_variants.py`, `qa_verification.py` are read-only checks.
- `fetch_all_*.py` re-download the source cache from the internet.

## Deploy on Vercel
New Vercel project from this repo · Framework: Other · Install: `npm ci` · Build: `npm run build`.
Nitro detects Vercel automatically. For other hosts set `NITRO_PRESET` (e.g. `netlify`, `node-server`).

## Not implemented yet
- P1–P5 device-condition questionnaire and deduction engine (assets are ready).
- Lead capture form — "Check Exact Value" currently opens WhatsApp with phone, variant and shown price.

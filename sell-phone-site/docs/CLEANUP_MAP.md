# Website 1 cleanup map (do NOT run until Website 2 is live and verified)

## Safe to remove from Website 1 later (used only by Sell Your Phone)
- `src/routes/sell-phone.tsx`, `sell-phone.index.tsx`, `sell-phone.$brand.index.tsx`, `sell-phone.$brand.$model.index.tsx`, `sell-phone.$brand.$model.$variant.tsx`
- `src/components/sell/SellParts.tsx`
- `src/data/sellPhoneCatalog.ts`, `sellPhoneCatalog.generated.json`, `sellPhonePricing.ts`, `dofyPriceCatalog.generated.json`
- `public/sell-phone/` (whole folder — only catalog logos/phones)
- `AboutDeviceQuestions/`
- Scripts: `import-sell-phone.py`, `generate_dofy_dataset.py`, `apply_price_markup.py`, `audit_data.py`, `brand_stats.py`, `check_matching.py`, `fetch_all_brand_models.py`, `fetch_all_models.py`, `inspect_all_variants.py`, `qa_verification.py`, plus the one-off dofy probes (`find_*.py`, `inspect_dofy.py`, `inspect_brand_js.py`, `test_*.py`, `brand_chunk.js`, `next_data_apple.json`, `model_sample_apple-iphone-15.json`, `sell-old-phone.json`)
- `dofy_cache/`, `DOFY_PRICE_RESEARCH_DATASET.csv`, `SELL_PHONE_IMPORT_REPORT.md`
- `UM_2/` — only after confirming nothing else in Website 1 reads it (raw images live only here; archive it first)

## Edits needed before deleting (shared files — keep the files)
- `src/components/public/PublicLayout.tsx` — SHARED. Change the "Sell Phone" header link and "Sell Your Phone" footer link to the new site's URL.
- `src/routes/sitemap[.]xml.ts` — check for `/sell-phone` entries and remove them.
- `src/routeTree.gen.ts` — regenerates itself; never edit by hand.
- `AGENTS.md` — remove the Sell Phone rules.

## Must stay in Website 1
`src/components/public/*` (Dock, BrandTagline, PublicLayout), `src/lib/shop.ts`, `src/lib/utils.ts`, `src/styles.css`,
`src/assets/um-*.jpg`, `public/USED_MOBILE_LOGO.png`, `public/favicon.ico`, all admin/catalog/reservation/payment code, `supabase/`.
Website 2 has its own copies of the shared ones.

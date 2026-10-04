
- Sell Phone catalog is static: generated JSON in src/data from scripts/import-sell-phone.py, images in public/sell-phone; no database or cloud storage — keeps it host-independent and fast.
- Sell Phone prices come only from src/data/dofyPriceCatalog.generated.json via src/data/sellPhonePricing.ts (exact brand+model+storage/RAM match, indexed once) — no hardcoded or derived prices.

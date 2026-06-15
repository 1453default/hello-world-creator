# USED MOBILES — Project Status

> **Single source of truth.** Updated automatically after every task, module, component, page, DB change, or bug fix.

**Last updated:** 2026-06-15 (Receipt system + image uploads + customer history)
**Stack:** TanStack Start v1 + React 19 + Vite 7 + Tailwind v4 + Lovable Cloud (Supabase)
**Phase progress:** 14 / 14 complete + receipt/image enhancements

---

## ✅ Completed

### Phase 1 — Foundation
- [x] Lovable Cloud enabled (Supabase backend wired)
- [x] Tailwind v4 design tokens in `src/styles.css` (brand palette, gradients, shadows)
- [x] Public layout shell (`src/components/public/PublicLayout.tsx`)
- [x] Shop info constants (address, phone, WhatsApp, maps)

### Phase 2 — Database Schema
- [x] Migration `20260615103926_*.sql` — core tables: `brands`, `phone_models`, `inventory_units`, `customers`, `sales`, `sale_items`, `user_roles`, `app_role` enum, `has_role()` security-definer fn
- [x] Migration `20260615104225_*.sql` — seed data (brands + sample phone models)
- [x] RLS enabled on all public tables with GRANTs
- [x] `user_roles` table separate from profiles (no privilege escalation)

### Phase 3 — Public Catalog & Auth
- [x] `/` — Home (`src/routes/index.tsx`) — hero, featured brands, CTAs
- [x] `/catalog` — Catalog grid with brand filter (`src/routes/catalog.tsx`)
- [x] `/brand/$slug` — Brand-specific listing (`src/routes/brand.$slug.tsx`)
- [x] `/phone/$slug` — Product detail page (`src/routes/phone.$slug.tsx`)
- [x] `/search` — Search route (`src/routes/search.tsx`)
- [x] `/contact` — Contact page w/ Maps embed, WhatsApp, phone (`src/routes/contact.tsx`)
- [x] `/auth` — Sign-in only (signup removed); Email + Password; clean professional UI; placeholders "Enter your email" / "Enter your password"; no credentials shown
- [x] Default admin seeded automatically via idempotent `/api/public/bootstrap-admin` (server-only credentials in `src/lib/bootstrap-admin.server.ts`, never in client bundle)
- [x] Mobile-first reactbits-style **Dock** navigation (`src/components/public/Dock.tsx`) replaces bottom-tab bar + WhatsApp FAB
- [x] `ProductCard` component
- [x] SEO head() on every public route (title, description, og)

### Phase 4 — Admin Shell
- [x] `_authenticated/route.tsx` layout gate (`ssr:false`, redirects unauth users to `/auth`)
- [x] `useCurrentUser` hook reads `user_roles` and exposes `isAdmin`
- [x] `/admin` route with sidebar + topbar shell (`src/components/admin/AdminLayout.tsx`)
- [x] Mobile drawer sidebar (Framer Motion slide-in)
- [x] Admin topbar (user email, role, sign out → `/auth`)
- [x] `/admin` dashboard with live KPI cards (available units, bills today, revenue today, products)
- [x] Quick-action cards linking to next-phase routes
- [x] Admin-only nav items hidden for staff (`adminOnly` flag)

---

## 🚧 In Progress
_None — awaiting next-phase instruction._

---

## ⏳ Pending

### Phase 5–14 — Admin CRUD, POS, Reports, Settings
- [x] `/admin/brands` — list, create, edit, delete, visibility & featured toggles
- [x] `/admin/products` — full CRUD with brand assignment, condition, image URL, listed/featured toggles, public-site sync via React Query invalidation
- [x] `/admin/inventory` — list with status filter, add unit with IMEI uniqueness, inline status change, delete
- [x] `/admin/pos` — search inventory by IMEI/product/brand, cart, customer attach, payment method, discount, atomic bill creation + inventory SOLD update
- [x] `/admin/bills` — list with item drill-down
- [x] `/admin/customers` — derived from bills with orders count & total spend
- [x] `/admin/reports` — revenue (today/7d/30d/all), stock value vs cost, top sellers
- [x] `/admin/users` — role assignment list (admin-only)
- [x] `/admin/settings` — shop info, GST, tax rate, receipt footer (admin-only)
- [x] `/admin/audit` — recent bill activity feed
- [x] Seeded 6 brands + 20 sample mobile products + 22 inventory units

## ✅ Receipt & UX Enhancements (2026-06-15)
- [x] Logo re-uploaded to CDN with correct project id — displays in admin, public layout, auth page, receipt
- [x] Dedicated standalone **Receipt route** `/_authenticated/receipt/$id` — renders only the invoice (no sidebar/topbar/admin shell), A4 print-friendly, `?print=1` auto-opens print dialog
- [x] Bills page: per-row **View Receipt** + **Print Receipt** actions (open in new tab, isolated)
- [x] POS auto-opens the new receipt page after a successful sale
- [x] `product-images` Supabase Storage bucket + RLS (public read, staff write)
- [x] `ProductImagesManager` component — multi-file upload, set primary, delete, in Product create/edit dialog
- [x] Catalog `.chip` / status pills given solid contrast & 1.5px borders for mobile + dark mode visibility
- [x] `ProductCard` condition badge swapped from translucent backdrop to solid white-on-shadow
- [x] Customers page — expandable inline accordion showing first/last purchase, full history with **bill #, date, product, IMEI, qty, unit/total price, payment method**, plus Receipt link per bill

## 📌 Routes added
- `/_authenticated/receipt/$id` (standalone receipt, auth-gated, no admin shell)

## 📌 Database tables touched
- `storage.objects` (new RLS policies for `product-images` bucket only)
- Existing tables read: `bills`, `bill_items`, `inventory_units`, `products`, `brands`, `product_images`

## 📌 Notes
- Currency: ₹ (INR)
- Shop: Used Mobiles, Samata Colony, Toli Chowki, Hyderabad 500008
- WhatsApp: +91 90004 64640
- Admin entry: sign in at `/auth`, then visit `/admin`.

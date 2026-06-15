# USED MOBILES — Project Status

> **Single source of truth.** Updated automatically after every task, module, component, page, DB change, or bug fix.

**Last updated:** 2026-06-15 (Phase 4 complete)
**Stack:** TanStack Start v1 + React 19 + Vite 7 + Tailwind v4 + Lovable Cloud (Supabase)
**Phase progress:** 4 / 14 complete

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

### Phase 5 — Brand & Model Management
- [ ] `/admin/brands` CRUD (list, create, edit, delete, logo upload)
- [ ] `/admin/models` CRUD (per-brand phone models with specs)
- [ ] Image upload to Supabase storage bucket
- [ ] Slug auto-generation + uniqueness check

### Phase 6 — Inventory Management
- [ ] `/admin/inventory` list (filter by brand/model/status)
- [ ] Add inventory unit (IMEI, condition, cost, price, color, storage, battery%)
- [ ] Edit / mark sold / mark available / scrap
- [ ] Bulk import (CSV)
- [ ] IMEI uniqueness validation

### Phase 7 — POS (Point of Sale)
- [ ] `/admin/pos` counter screen
- [ ] Search inventory by IMEI / model / brand
- [ ] Cart with line items + discount per item + overall discount
- [ ] Customer attach (search existing or quick-create)
- [ ] Payment method (cash / UPI / card / split)
- [ ] Submit sale → marks inventory units `sold`, creates `sales` + `sale_items` rows
- [ ] Print/share receipt after sale

### Phase 8 — Receipts / Invoices
- [ ] Receipt template (mirrors uploaded sample invoice)
- [ ] PDF generation (server function, edge-safe lib)
- [ ] Shareable receipt link (`/r/$saleId`)
- [ ] WhatsApp share button (pre-filled message)

### Phase 9 — Customers
- [ ] `/admin/customers` list with search
- [ ] Customer profile: purchase history, total spend
- [ ] Quick-create from POS

### Phase 10 — Reports
- [ ] `/admin/reports` daily / weekly / monthly sales
- [ ] Revenue, profit (price − cost), units sold
- [ ] Top-selling brands / models
- [ ] Stock valuation report
- [ ] Export CSV

### Phase 11 — User Management
- [ ] `/admin/users` (admin-only)
- [ ] Invite staff (role: admin / cashier)
- [ ] Revoke access

### Phase 12 — Settings
- [ ] `/admin/settings` — shop info, GST, currency, receipt footer
- [ ] Logo upload
- [ ] Tax rate configuration

### Phase 13 — Audit Log
- [ ] `audit_log` table
- [ ] Auto-log inventory changes, sales, deletions, role grants
- [ ] `/admin/audit` viewer

### Phase 14 — Polish & Launch
- [ ] Per-model product images (generate or staff upload)
- [ ] Loading skeletons everywhere
- [ ] Empty states
- [ ] Error boundaries on all admin routes
- [ ] Mobile responsiveness pass
- [ ] Performance audit (Lighthouse)
- [ ] Publish to production

---

## 🐛 Known Issues
- Seeded products have no images — phone-icon placeholder shown on cards.
- New signups receive `staff` role only; admin role must be granted manually via SQL until Phase 11 (`INSERT INTO public.user_roles (user_id, role) VALUES ('<uuid>', 'admin')`).

## 📌 Next Steps
1. **Phase 5 — Brands CRUD** at `/admin/brands` (list/create/edit/delete + logo upload to `brand-logos` bucket).
2. **Phase 5 — Products CRUD** at `/admin/products` (per-brand models, specs, multi-image upload).
3. **Phase 6 — Inventory list & add-unit form** at `/admin/inventory` with IMEI uniqueness validation and status transitions.
4. **Phase 6 — Inventory status flows**: mark sold / available / scrap with optimistic updates and audit trail prep.
5. **Phase 7 — POS** at `/admin/pos` (search by IMEI, cart, customer attach, payment method, atomic bill creation).

## 📌 Notes
- Currency: ₹ (INR)
- Shop: Mahaboob Mobiles, Samata Colony, Toli Chowki, Hyderabad 500008
- WhatsApp: +91 90004 64640
- Admin entry: sign in at `/auth`, then visit `/admin`.

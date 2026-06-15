# ═══════════════════════════════════════════════════════════
# PROGRESS TRACKER — ATTACH THIS WITH EVERY LOVABLE SESSION
# ═══════════════════════════════════════════════════════════

## INSTRUCTION TO LOVABLE

From this point forward, you must maintain a file called `PROJECT_STATUS.md` in the root of this project. This file is the single source of truth for everything that has been built and everything that still needs to be built.

**Update this file automatically after completing every task, every module, every component, every page, every database change, and every bug fix — without being asked.**

---

## FILE TO CREATE AND MAINTAIN: `PROJECT_STATUS.md`

Create this file immediately at the project root with the following structure and keep it updated in real time as work progresses:

```markdown
# USED MOBILES — Project Status

**Last Updated:** [timestamp of last change]  
**Project:** USED MOBILES Platform  
**Stack:** React + TypeScript + Vite + Tailwind + Supabase + Framer Motion

---

## QUICK SUMMARY
[One paragraph describing the current state of the project — what works right now if someone were to open the app.]

---

## ✅ COMPLETED

### Database
- [ ] (mark each table/schema item as done when created)

### Authentication
- [ ] Login page
- [ ] Supabase auth integration
- [ ] Role guard (super_admin / admin / staff)
- [ ] Protected route wrapper
- [ ] Role-based redirects

### Public Site
- [ ] PublicLayout (header, footer, bottom nav, WhatsApp FAB)
- [ ] Home page — hero search
- [ ] Home page — brand chips
- [ ] Home page — budget filter chips
- [ ] Home page — latest arrivals section
- [ ] Home page — featured phones section
- [ ] Home page — browse by brand section
- [ ] Home page — WhatsApp CTA section
- [ ] Home page — footer with shop info
- [ ] Catalog page — product grid
- [ ] Catalog page — search
- [ ] Catalog page — filters (brand, condition, price)
- [ ] Catalog page — sort
- [ ] Catalog page — load more pagination
- [ ] Product Detail page — image gallery
- [ ] Product Detail page — specs display
- [ ] Product Detail page — WhatsApp enquiry button
- [ ] Product Detail page — similar phones
- [ ] Brand Results page
- [ ] Search Results page
- [ ] Contact / About page
- [ ] 404 page

### Admin Panel
- [ ] AdminLayout — dark sidebar
- [ ] AdminLayout — top navigation bar
- [ ] AdminLayout — mobile sidebar (Framer Motion)
- [ ] Admin Dashboard — KPI cards (live data)
- [ ] Admin Dashboard — recent bills table
- [ ] Admin Dashboard — low stock alerts
- [ ] Admin Dashboard — quick actions

### Brand Management
- [ ] Brands list table
- [ ] Add brand form
- [ ] Edit brand
- [ ] Brand logo upload (Supabase Storage)
- [ ] Hide/show toggle
- [ ] Featured toggle
- [ ] Display order / reorder
- [ ] Delete brand (with safety check)

### Product Management
- [ ] Products list table (with filters)
- [ ] Product create form
- [ ] Product edit form
- [ ] Image upload from device (Supabase Storage)
- [ ] Camera capture input
- [ ] Multi-image preview + reorder
- [ ] Primary image selector
- [ ] Listed / unlisted toggle
- [ ] Featured toggle
- [ ] Soft delete product

### Inventory Management
- [ ] Inventory list table (with status filter)
- [ ] Add inventory unit form
- [ ] Edit inventory unit
- [ ] Status change (AVAILABLE → RESERVED → AVAILABLE)
- [ ] Mark DEFECTIVE
- [ ] Inventory unit detail page
- [ ] Search by IMEI / unit code

### Billing / POS
- [ ] POS layout (search panel + bill panel)
- [ ] Available inventory unit search
- [ ] Add item to bill
- [ ] Remove item from bill
- [ ] Discount input
- [ ] Payment method selector
- [ ] Bill number generation
- [ ] Save bill (atomic: bill + items + inventory status update)
- [ ] Rollback on failure
- [ ] Audit log on bill save

### Receipt
- [ ] PrintLayout (ISOLATED — no admin chrome)
- [ ] Receipt page (/receipt/:billId)
- [ ] Receipt reads from bill_items SNAPSHOTS only
- [ ] Print button (screen only)
- [ ] Back to bills button (screen only)
- [ ] @media print CSS (hides buttons, sets margins)
- [ ] Receipt matches shop_settings data

### Reports
- [ ] Sales overview KPIs
- [ ] Revenue chart (Recharts — last 30 days)
- [ ] Payment method breakdown chart
- [ ] Top products table
- [ ] Inventory summary counts
- [ ] Low stock alert section
- [ ] Brand performance table
- [ ] Date range filter

### Users
- [ ] Users list
- [ ] Invite user (Supabase auth)
- [ ] Edit role
- [ ] Activate / deactivate user
- [ ] Last login display

### Settings
- [ ] Shop info section (name, address, phone, WhatsApp)
- [ ] Receipt config (footer text, invoice prefix)
- [ ] Threshold settings (low stock alert number)
- [ ] Save to Supabase shop_settings

### Audit Logs
- [ ] Audit logs table (paginated)
- [ ] Filter by action / user / date
- [ ] Expand row for old_data / new_data JSON

### Sample Data
- [ ] 9 brands seeded
- [ ] 20 products seeded
- [ ] 20 inventory units seeded (all AVAILABLE)
- [ ] Shop settings seeded

---

## 🔄 IN PROGRESS
[List anything currently being worked on with specific detail about what's done and what's remaining within that task]

---

## ❌ NOT STARTED YET
[Auto-populated — everything from the checklist above that has not been checked off]

---

## 🐛 KNOWN ISSUES / BUGS
[List any bugs discovered during build, even if not yet fixed]

---

## 📁 KEY FILES REFERENCE
[Auto-maintained list of important files and what they contain]

| File Path | Purpose |
|---|---|
| `src/lib/supabase.ts` | Supabase client |
| `src/routes/AdminLayout.tsx` | Admin shell with sidebar |
| `src/routes/PrintLayout.tsx` | Isolated receipt print layout |
| `src/routes/PublicLayout.tsx` | Public site shell |
| `src/hooks/useBrands.ts` | Brand query hooks |
| `src/hooks/useProducts.ts` | Product query hooks |
| `src/hooks/useInventory.ts` | Inventory query hooks |
| `src/hooks/useBills.ts` | Billing query hooks |
| `src/pages/admin/POSPage.tsx` | POS / billing screen |
| `src/pages/print/ReceiptPrintPage.tsx` | Receipt print page |

---

## 🔑 ENVIRONMENT VARIABLES NEEDED
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 📌 NEXT STEPS
[The next 3–5 specific tasks to be done, in priority order, with enough detail that someone new can pick up immediately]

1. 
2. 
3. 
4. 
5. 
```

---

## MAINTENANCE RULES FOR LOVABLE

1. **Every time you complete a component, page, or module** → check the corresponding item in `PROJECT_STATUS.md` and update `Last Updated` timestamp.
2. **Every time you start a new task** → move it to `🔄 IN PROGRESS`.
3. **Every time you discover a bug** → add it to `🐛 KNOWN ISSUES`.
4. **Every time you create a new important file** → add it to `📁 KEY FILES REFERENCE`.
5. **Always keep `📌 NEXT STEPS` accurate** — it must reflect the real next tasks based on the build order from the master prompt (Phase 1 through Phase 14).
6. **The `QUICK SUMMARY` paragraph** must always describe what someone would experience if they opened the app right now.
7. **Do not remove completed items** — keep the full checklist with checkmarks so history is preserved.
8. **This file must be committed with every code change** — treat it as equally important as the source code.

---

*Attach this file alongside the Master Prompt in every new Lovable session.*

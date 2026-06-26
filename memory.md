# Memory — Feature 25 Inventory Management System

Last updated: 2026-06-26T14:31+06:00

## What was built

### Database (3 migrations)
1. `20260626030000_create_inventory_tables.sql` — `inventory_items` table (name, sku_prefix, type simple/variable, status draft/transferred, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes, transferred_to_product_id FK) + `inventory_variants` table (SKU, purchase_price, selling_price, stock, is_active). Full admin/manager RLS.
2. `20260626031000_seed_inventory_items.sql` — 35 seed items (guarded — skips if categories/brands empty).
3. `20260626032000_inventory_fixes.sql` — transfer + revert RPCs (atomic, FOR UPDATE locked), `updated_at` triggers, variant `deleted_at` cascade, trigram search index, supplier DISTINCT RPC.

### Admin UI
- `/admin/inventory` — list ordered by `updated_at DESC`, filters, Transfer (draft) / Revert (transferred) / Edit / Delete per row
- `/admin/inventory/new` — form with parallel variant creates via `Promise.all`
- `/admin/inventory/[id]/edit` — read-only for transferred items with "View Storefront Product" link

### Transfer & Revert (atomic RPCs)
- `transfer_inventory_to_product` — locks row, validates category + variants, creates product + variants in single tx
- `revert_inventory_transfer` — locks row, soft-deletes product, restores item to draft

### Post-deploy fixes
- Removed admin sidebar internal scroll (`overflow-y-auto` from nav)
- Auth redirect role-aware: admin/manager → `/admin/dashboard`, customer → `/account` (fixed in signin, OAuth callback, API callback)

### Files summary
| File | Purpose |
|------|---------|
| `supabase/migrations/20260626030000_*.sql` | Tables + RLS |
| `supabase/migrations/20260626031000_*.sql` | Seed (guarded) |
| `supabase/migrations/20260626032000_*.sql` | RPCs + triggers + indexes |
| `types/admin-inventory.ts` | Type definitions |
| `repositories/inventory.repository.ts` | DB CRUD (updated_at sort) |
| `services/inventory.service.ts` | Validation + RPC calls + audit |
| `actions/inventory.actions.ts` | Server actions + revalidation |
| `components/admin/InventoryList.tsx` | List + Transfer/Revert/Delete |
| `components/admin/InventoryForm.tsx` | Form with parallel variant ops |
| `app/admin/inventory/` (3 pages) | List / new / edit |
| `lib/auth/resolve-redirect.ts` | Role-aware post-login redirect |
| `components/admin/AdminSidebar.tsx` | No internal scroll |
| `app/(storefront)/signin/page.tsx` | Role-aware redirect |
| `app/(storefront)/auth/callback/page.tsx` | Role-aware redirect |
| `app/api/auth/callback/route.ts` | Role-aware redirect |

**Build:** 0 TS errors, 0 lint warnings. 3 migrations pending manual deploy.

## Decisions made

- Inventory completely separate from Products — separate tables, separate pages. Transfer is one-way with explicit Revert.
- Transfer/revert are atomic RPCs with FOR UPDATE locks — no TOCTOU races.
- No inventory images. Transfer creates product in `draft` — admin reviews before setting `active`.
- Category required for transfer (admin product list uses `!inner` join).
- List ordered by `updated_at DESC` — recently edited items at top.
- Auth redirect uses role lookup against `public.users` table.

## Current state

- Feature 25 fully complete with 35 seed items, atomic transfer + revert, sidebar fixes, role-aware login redirects
- 3 migrations pending manual deployment
- Build: 0 TS errors, 0 lint warnings

## Next session starts with

Feature 26 — Email Notifications with Resend integration

## Open questions

- None

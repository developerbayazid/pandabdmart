# Memory — Feature 25 Inventory Management System

Last updated: 2026-06-26T14:22+06:00

## What was built

### Database (3 migrations)
1. `20260626030000_create_inventory_tables.sql` — `inventory_items` table (name, sku_prefix, type simple/variable, status draft/transferred, supplier, purchase_price, selling_price, reorder_point, warehouse_location, notes, transferred_to_product_id FK) + `inventory_variants` table (SKU, purchase_price, selling_price, stock, is_active). Full admin/manager RLS on both. Indexes on category, brand, status, supplier, variant SKU.
2. `20260626031000_seed_inventory_items.sql` — 35 seed items across 20 categories, 6 suppliers. Mixed simple/variable types. Guard skips if categories/brands empty.
3. `20260626032000_inventory_fixes.sql` — **transfer RPC** (`transfer_inventory_to_product`: FOR UPDATE lock, single transaction, category/variant validation, bulk variant inserts, idempotent) + **revert RPC** (`revert_inventory_transfer`: soft-deletes product, restores item to draft) + `updated_at` triggers on both tables + `deleted_at` cascade on variants + trigram search index + `get_distinct_inventory_suppliers` RPC.

### Admin UI — 3 pages
- **Inventory List** (`/admin/inventory`) — ordered by `updated_at DESC` (recently edited items at top). Filters: search, category, brand, supplier, status. Per-row: Transfer (draft items), Revert (transferred items), Edit (disabled for transferred), Delete.
- **New Item** (`/admin/inventory/new`) — form with variant builder. Variant creates run in parallel via `Promise.all`.
- **Edit Item** (`/admin/inventory/[id]/edit`) — read-only view for transferred items with "View Storefront Product" link. Parallel variant mutations on save.

### Transfer flow (atomic)
- RPC `transfer_inventory_to_product` — locks row with FOR UPDATE, validates NOT already transferred, validates category exists (NULL rejected with clear error), validates variants > 0, generates slug, creates product + bulk variant inserts in one transaction.
- Reject reasons: "Not authorized", "Item not found", "Already transferred", "No category", "No variants"

### Revert flow (atomic)
- RPC `revert_inventory_transfer` — locks row with FOR UPDATE, validates status = 'transferred', soft-deletes linked product (`deleted_at = now()`), clears `transferred_to_product_id`, sets status back to `draft`.
- Revert button (Undo2 icon) on transferred items with confirmation dialog.

### Files created
| File | Purpose |
|------|---------|
| `supabase/migrations/20260626030000_create_inventory_tables.sql` | Tables + RLS |
| `supabase/migrations/20260626031000_seed_inventory_items.sql` | 35 seed items (guarded) |
| `supabase/migrations/20260626032000_inventory_fixes.sql` | Transfer/revert RPCs + triggers + indexes |
| `types/admin-inventory.ts` | Type definitions |
| `repositories/inventory.repository.ts` | DB CRUD + list/filter/pagination (updated_at sort) |
| `services/inventory.service.ts` | Validation (prices), RPC calls, audit logging |
| `actions/inventory.actions.ts` | Server actions + revalidation |
| `components/admin/InventoryList.tsx` | List + Transfer/Revert/Delete buttons |
| `components/admin/InventoryForm.tsx` | Create/edit form with parallel variant ops |
| `app/admin/inventory/page.tsx` | List page |
| `app/admin/inventory/new/page.tsx` | Create page |
| `app/admin/inventory/[id]/edit/page.tsx` | Edit page (read-only for transferred) |

**Build:** 0 TS errors, 0 lint warnings. 3 migrations pending manual deploy.

## Decisions made

- Inventory is a completely separate system from Products — separate tables, separate admin pages, separate concerns. Transfer is one-way (inventory → product, with link back), revert is explicitly supported.
- Transfer and revert are atomic via `SECURITY DEFINER` RPCs with `FOR UPDATE` row locks — no TOCTOU races, no partial failures.
- No inventory images — internal tracking only. Images come after transfer when product is edited in Products admin.
- Variants matched existing product_variant pattern but without attribute linkage or images.
- `sku_prefix` on inventory_items (not individual SKU) — variants derive SKU from prefix + suffix.
- Suppliers stored as free-text with datalist autocomplete from existing values, queried via server-side `DISTINCT` RPC.
- Transfer creates product in `draft` status — admin must review/edit before setting `active`.
- Category is required for transfer (admin product list uses `!inner` join — NULL FK silently excludes product).
- List ordered by `updated_at DESC` — recently edited items always appear first.

## Problems solved

- **TOCTOU race in transfer** — replaced service-layer multi-step transfer with single transactional RPC using FOR UPDATE.
- **Concurrent transfer creates duplicate products** — RPC idempotent: checks status within locked transaction.
- **Transfer creates product with no variants** — RPC validates variant count > 0 before creating product.
- **Transfer crashes with NULL category** — RPC returns clear error; admin product list `!inner` join documented as the reason.
- **Null FK coerced to empty string** — service no longer handles transfer directly; RPC passes NULL through correctly.
- **Missing updated_at triggers** — added with matching `trg_set_updated_at_*` naming convention.
- **Soft delete orphans variants** — `deleted_at` column on inventory_variants + cascade trigger.
- **Transferred items editable** — edit page shows read-only view with product link.
- **Supplier query fetches all rows** — server-side `SELECT DISTINCT` via RPC with `deleted_at IS NULL` filter.
- **Sequential variant API calls** — form submit uses `Promise.all` for parallel creates/deletes/updates.
- **Seed silently fails on empty DB** — DO block checks category/brand counts, exits with RAISE NOTICE if empty.
- **ILIKE search full table scan** — GIN trigram index with graceful fallback.
- **Trigger naming collision** — corrected to `trg_set_updated_at_inventory_*` + DROP IF EXISTS for old names.
- **Idempotent migrations** — ALTER TABLE ADD COLUMN wrapped in DO block catching duplicate_column; all CREATE TRIGGER preceded by DROP IF EXISTS.

## Current state

- Feature 25 fully complete — 35 seed items, full CRUD, atomic transfer + revert, admin sidebar integration
- 3 migrations pending manual deployment
- Build: 0 TS errors, 0 lint warnings

## Next session starts with

Feature 26 — Email Notifications with Resend integration

## Open questions

- None

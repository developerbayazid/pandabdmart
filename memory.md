# Memory — Feature 18: Product & Variant Management + Image Fix

Last updated: 2026-06-17 07:48

## What was built

**Feature 18 — Product & Variant Management (Admin CRUD):**

New files:
- `repositories/audit.repository.ts` — `insertAuditLog()`, `getAuditLogs()`
- `services/audit.service.ts` — `logAuditEvent()` wrapper
- `services/product.service.ts` — full CRUD with validation + audit
- `actions/product.actions.ts` — Server Actions with storefront revalidation
- `types/admin-product.ts` — all admin product types
- `lib/upload.ts` — Supabase Storage image upload (browser client)
- `components/admin/ProductList.tsx` — search/filter/pagination table
- `components/admin/ProductForm.tsx` — create/edit form with variant cards
- `components/admin/ImageUpload.tsx` — multi-image upload with preview
- `app/admin/products/page.tsx` — listing page (server)
- `app/admin/products/new/page.tsx` — create page (server)
- `app/admin/products/[id]/edit/page.tsx` — edit page (server)

**Image display fix:**
- `supabase/migrations/20260617160000_add_storage_public_select.sql` — public SELECT policy on storage.objects
- `next.config.ts` — added `images.remotePatterns` for Supabase storage domain
- `actions/product.actions.ts` — added `revalidatePath('/shop')` and `revalidatePath('/')` after all mutations

Modified files:
- `repositories/product.repository.ts` — 11 admin CRUD functions added
- `lib/constants/pagination.ts` — `ADMIN_PRODUCTS_PER_PAGE = 20`
- `supabase/config.toml` — removed invalid `db.schema` key

## Decisions made

- **Audit logging is non-blocking.** `logAuditEvent` catches errors silently — business mutations complete even if audit fails. This matches code-standards.md philosophy ("never let one failure crash an order").
- **Variant CRUD is sequential in repository layer**, not in an RPC. Review noted this as non-atomic risk. Fixed by throwing errors on attribute/image failures instead of silent `console.error`.
- **ProductForm error handling fixed post-review.** Every `createVariantAction`/`updateVariantAction` result is now checked for `.success`; form stops on first failure with error displayed.
- **`updateVariant` now validates `price >= 0` and `stock >= 0`** matching `createVariant`.
- **Storage bucket SELECT policy was missing from initial migration.** Added via `20260617160000_add_storage_public_select.sql`. Without it, anonymous users get 403 on image URLs.
- **Next.js `<Image>` requires `remotePatterns`.** Added Supabase storage domain to `next.config.ts`.
- **Storefront revalidation added** to all product/variant mutations to flush ISR cache after admin edits (shop, homepage, product pages).

## Problems solved

- **Product images missing in frontend after admin upload.** Root causes: (1) No public SELECT policy on `storage.objects` for `product-images` bucket — anonymous reads returned 403. (2) Next.js `<Image>` rejected external Supabase URLs without `remotePatterns`. (3) Storefront ISR pages served stale cached content for up to 5 minutes.
- **Hard-coded FK constraint name.** Changed `users!audit_logs_actor_id_fkey` to `users!inner` to avoid deploy breakage.
- **Unused imports.** Removed `Filter`, `Input`, `Select`, `AdminCategoryOption`, `AdminBrandOption` from components.

## Current state

- Phase 5: Features 17 and 18 complete. Build: clean (0 TS errors).
- Admin dashboard: `/admin/dashboard` with live stats + realtime.
- Admin products: `/admin/products` listing, create, edit, delete with full CRUD + audit.
- Image upload pipeline working (browser → Supabase Storage → public URL → variant_images → frontend display).
- Storage migration `20260617160000_add_storage_public_select.sql` **pending manual deployment** — run via Supabase dashboard SQL editor.

## Next session starts with

Phase 5 — Feature 19: Category & Brand Management. Admin CRUD for categories (tree view, drag reorder/reparent, slug/path recalculation) and brands (simple list CRUD). Audit logging already in place.

## Open questions

- SSLCommerz API keys needed to un-hide SSLCommerz from payment selector
- Why did the repository-based page pattern cause the wishlist tab to not fetch data?
- Storage migration `20260617160000` needs manual deployment (Supabase CLI `db push` failed because project isn't linked locally)

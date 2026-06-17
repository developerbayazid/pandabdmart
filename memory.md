# Memory — Feature 18 + Admin UX Polish

Last updated: 2026-06-17 08:25

## What was built

**Feature 18 — Product & Variant Management:**
- `repositories/audit.repository.ts`, `services/audit.service.ts` — audit logging infra
- `services/product.service.ts` — full admin CRUD with validation + audit
- `actions/product.actions.ts` — Server Actions with storefront revalidation
- `types/admin-product.ts` — admin product types
- `lib/upload.ts` — Supabase Storage image upload (browser client)
- `components/admin/ProductList.tsx` — listing table with search/filter/pagination
- `components/admin/ProductForm.tsx` — create/edit form with variant cards + ImageUpload
- `components/admin/ImageUpload.tsx` — multi-image upload with preview
- `app/admin/products/page.tsx`, `new/page.tsx`, `[id]/edit/page.tsx`
- Extended `repositories/product.repository.ts` with 11 admin CRUD functions
- `next.config.ts` — `images.remotePatterns` for Supabase storage
- `supabase/migrations/20260617160000_add_storage_public_select.sql` — pending manual deployment

**Admin UX Polish (post-review fixes):**
- Sidebar restructured: Catalog group removed, Products/Categories/Brands are top-level nav items
- Scrollbar eliminated: pure flexbox layout (`h-screen flex flex-col`, `overflow-hidden` on body row, internal scrolling)
- Suspense on all admin pages: dashboard, product listing, create, edit
- `<a>` tags replaced with `<Link>` for SPA navigation

## Decisions made

- **Layout: pure flexbox, no positioning hacks.** `h-screen flex flex-col` → header (shrink-0) + body row (flex-1 overflow-hidden) → sidebar (shrink-0 w-[280px]) + main (flex-1 overflow-y-auto). No `fixed`, no `absolute`, no `calc`, no JS body manipulation.
- **Sidebar nav is top-level, not collapsible Catalog group.** Simpler, clearer information architecture.
- **Sidebar nav has `overflow-y-auto`** for when content exceeds viewport — this is a deliberate sidebar scrollbar, not a bug.
- **All links use `<Link>`** for client-side SPA navigation, no full-page reloads.

## Problems solved

- **Product images not showing in frontend.** Root causes: (1) Missing public SELECT policy on storage.objects, (2) Missing Next.js images.remotePatterns, (3) Storefront ISR not revalidated after admin edits.
- **Scrollbar on admin pages.** Root cause: `fixed`/`absolute` positioning with `min-h-full` body created overflow. Fixed by pure flexbox layout with `h-screen overflow-hidden`.
- **Full page reload on "Edit" click.** `<a>` tags replaced with Next.js `<Link>`.
- **No Suspense on product pages.** Added sync wrapper + async content pattern to all admin routes.

## Current state

- Phase 5: Features 17-18 complete with UX polish. Build: clean (0 TS errors).
- Admin dashboard: `/admin/dashboard` with Suspense + realtime
- Admin products: full CRUD with Suspense + SPA navigation + image upload
- Storage migration `20260617160000` pending manual deployment
- Admin layout: no scrollbar, clean flexbox, all `<Link>` navigation

## Next session starts with

Phase 5 — Feature 19: Category & Brand Management.

## Open questions

- SSLCommerz API keys needed
- Wishlist tab Suspense + repository interaction root cause not diagnosed
- Storage migration `20260617160000` needs manual deployment via Supabase dashboard

# Memory — Feature 24 Store Settings (Complete Frontend Customization)

Last updated: 2026-06-26T13:17+06:00

## What was built

### Migrations (3 total)
1. `20260626000000_create_store_settings.sql` — base `store_settings` table (14 cols) + RLS admin read/update
2. `20260626010000_add_frontend_settings.sql` — 35 frontend text customization columns + public SELECT policy
3. `20260626020000_add_product_curation.sql` — product curation (featured product ID + JSONB arrays for product cards/trending/recent) + collection grid (5 images + 5 links)

### Admin UI — 8-tab SettingsForm
- **General** — store info + logo/favicon with image upload
- **Header** — announcement bar toggle/text/CTA, business hours
- **Footer** — tagline, copyright, 5 social URLs
- **Hero** — 3 slides (title/subtitle/image/price) with image upload, CTA
- **Homepage** — section headings for Trending, Recent, Festive, LatestNews + festive banner image upload
- **Products** — product curation with search autocomplete (featured product picker via `searchProductsAction`, comma-separated UUID inputs for product cards/trending/recent grids)
- **Collection** — 5 masonry grid images with upload buttons + link URLs
- **SEO & Inventory** — meta title/description, products per page, out-of-stock toggle, low stock threshold, stock reservation

### Image Upload System
- `lib/upload.ts` — added `uploadSettingsImage(file)` uploading to `product-images/settings/{filename}` (existing admin storage RLS covers this path)
- `components/admin/SettingsForm.tsx` — `ImageField` sub-component with upload button, URL text input, image preview, clear button; used for logo, favicon, 3 hero images, festive banner image, 5 collection images

### Product Curation
- `actions/settings.actions.ts` — added `searchProductsAction(query)` for admin product search autocomplete
- `repositories/product.repository.ts` — added `getProductsByIds(ids)` to fetch specific products preserving order
- SettingsForm Products tab: featured product picker (search by name → fills UUID), comma-separated UUID inputs for product cards/trending/recent (leave empty = auto)

### Frontend Wiring
- `app/(storefront)/page.tsx` — reads curated product IDs from settings, fetches specific products via `getProductsByIds`, falls back to auto when empty; passes collection items to CollectionGrid
- `components/home/CollectionGrid.tsx` — accepts `items: CollectionGridItem[]` prop with links, wraps images in `<Link>`, adds hover zoom

### Updated Files Summary
| File | Change |
|------|--------|
| `supabase/migrations/20260626020000_add_product_curation.sql` | NEW |
| `lib/upload.ts` | +uploadSettingsImage |
| `types/admin-settings.ts` | +CollectionGridItem, +curation fields, +collection fields |
| `repositories/settings.repository.ts` | +15 new field mappings, +parseJsonArray helper |
| `repositories/product.repository.ts` | +getProductsByIds |
| `actions/settings.actions.ts` | +searchProductsAction |
| `components/admin/SettingsForm.tsx` | 8 tabs, ImageField, ProductCurationTab |
| `app/(storefront)/page.tsx` | Product curation logic, CollectionGrid props |
| `components/home/CollectionGrid.tsx` | Accepts items prop, links, hover zoom |

**Build:** 0 TS errors. 3 migrations pending manual deploy.

## Decisions made

- Settings images uploaded to `product-images/settings/` path (reuses existing bucket + admin storage RLS — no new bucket needed)
- Product curation uses comma-separated UUIDs input (simple, copy-paste from product listing) with search autocomplete for single featured product
- `getProductsByIds` preserves input order (uses `Map` lookup) — admin's ordering is respected
- Collection images wrapped in `<Link>` with hover zoom (matches other card patterns)
- Image upload is client-side via `uploadSettingsImage` (same pattern as product image upload)
- When curated product IDs are empty, homepage falls back to auto-selection (backward compatible)

## Problems solved

- **Image upload in SettingsForm**: Created a non-intrusive `ImageField` component — inline upload button next to URL text input, with thumbnail preview. Uses hidden `<input type="file">` triggered programmatically.
- **Product picker UX**: Used search autocomplete for single product (featured) and comma-separated UUID text inputs for multi-product sections (simpler than building a full multi-select modal).

## Current state

- Feature 24 fully complete — 60+ configurable settings across 8 tabs, with image uploads and product curation
- All frontend components fully database-driven (no hardcoded content)
- 3 migrations pending manual deployment
- Build: 0 TS errors

## Next session starts with

Feature 25 — Email Notifications with Resend integration

## Open questions

- None

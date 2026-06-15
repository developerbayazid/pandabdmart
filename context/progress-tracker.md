# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 3 — Cart & Checkout
**Last completed:** 11 Cart Logic — Guest + Authenticated
**In progress:** —

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage (Storefront)
- [x] 02 Auth
- [x] 03 Database Schema (21 tables + 79 RLS policies + storage + realtime deployed)
- [x] 04 Base Layouts & Shared UI

### Phase 2 — Catalog (Storefront)

- [x] 05 Shop / Product Listing Page — Full UI
- [x] 06 Shop Listing — Real Data + Filters/Search
- [x] 07 Category Pages — Full UI + Real Data
- [x] 08 Product Detail Page — Full UI
- [x] 09 Product Detail — Real Data + Variant Logic

### Phase 3 — Cart & Checkout

- [x] 10 Cart Page — Full UI
- [x] 11 Cart Logic — Guest + Authenticated
- [ ] 12 Checkout Page — Full UI
- [ ] 13 SSLCommerz Payment Flow
- [ ] 14 bKash / Nagad Manual Payment Flow

### Phase 4 — Order Tracking & Customer Dashboard

- [ ] 15 Order Tracking Page — Full UI + Real Data
- [ ] 16 Customer Dashboard — Full UI + Real Data

### Phase 5 — Admin Panel

- [ ] 17 Admin Dashboard — Full UI + Real Data
- [ ] 18 Product & Variant Management
- [ ] 19 Category & Brand Management
- [ ] 20 Order Management & MFS Verification
- [ ] 21 Coupons & Shipping Zones Management
- [ ] 22 Customer & User Management
- [ ] 23 Audit Log Viewer

### Phase 6 — Notifications, SEO & Polish

- [ ] 24 Email Notifications
- [ ] 25 SEO & Performance Pass
- [ ] 26 Reviews Moderation (Optional)

---

## Notes

- **01 Homepage complete** — all sections built: Navbar, Hero carousel (autoplay + smooth transitions), Featured Product, Product Cards, Trending Products (tab filtering with smooth animations), Collection Grid, Festive Banner, Recent Products (12 items with pagination), Latest News, Footer.
- All Tailwind classes use CSS variables from `globals.css` `@theme` block. No raw Tailwind colors or hardcoded hex values in components.
- **02 Auth complete** — Supabase Auth setup: `lib/supabase/client.ts`, `server.ts`, `admin.ts` (three-client pattern); `proxy.ts` at project root with lightweight session check (`getSession()`, no DB calls); `lib/auth/get-user.ts` (server-side user + role fetch, resilient to missing users table), `require-auth.ts`, `require-role.ts`; auth pages at `/signin` (password + magic link toggle, email-only signup — OAuth providers removed), `/register`, `/forgot-password`; client-side magic link callback page at `/auth/callback`; OAuth API callback at `app/api/auth/callback/route.ts` (handles both `code` and `token_hash`); `(dashboard)` route group layout with sidebar + sign out (server action); `app/admin/layout.tsx` with sidebar (role-aware: Admin sees full nav; Shop Manager sees limited nav) + sign out; Account page at `/account`; Admin Dashboard placeholder at `/admin/dashboard`. Auth-aware navbar via `components/auth/AuthNavActions.tsx` (shows Sign In icon for guests, Account + Sign Out for authenticated users). Signed-in users are redirected away from `/signin`, `/register`, `/forgot-password` to `/account`. Email confirmation disabled in Supabase for dev (avoids free-tier rate limit).
- **03 Database Schema — deployed and verified.** 21 tables, 79 RLS policies, 24 indexes, `handle_new_user()` trigger (SECURITY DEFINER, backfills existing `auth.users`), `updated_at` triggers on 11 entity tables, Realtime publication on `orders`/`payments`/`product_variants`, helper functions (`is_admin()`, `is_admin_or_manager()`, `set_updated_at()`). `product-images` storage bucket created with public read + admin/manager write RLS. Migrations: `supabase/migrations/20260613150000_initial_schema.sql` (initial schema), `20260613155000_storage_rls.sql` (storage policies). Constants: `lib/constants/inventory.ts`, `order.ts`, `roles.ts`, `pagination.ts`.
- `proxy.ts` (not `middleware.ts`) handles route-group session checks per architecture.md — created as part of 02. Admin layout lives at `app/admin/layout.tsx` (not inside a route group) so URLs resolve as `/admin/dashboard`, `/admin/products`, etc.
- **04 Base Layouts & Shared UI complete** — `(storefront)` route group created with `layout.tsx` (Navbar + Footer wrapper); homepage moved to `app/(storefront)/page.tsx` with Navbar/Footer stripped. `(dashboard)` and `app/admin/layout.tsx` already existed from 02 and are functional. Shared UI primitives created in `components/ui/`: Button (primary/secondary/destructive/ghost variants), Input, Select, Badge (neutral/success/warning/error/info), Card (with Header/Title/Description/Content/Footer subcomponents), Skeleton (with text and card presets), Table (with Header/Body/Row/Head/Cell), Pagination (with ellipsis), Modal (with ESC/click-outside/overflow lock), Toast (with ToastProvider and `useToast` hook). Root-level `app/loading.tsx` (spinner), `app/error.tsx` (reset + home), `app/not-found.tsx` (404 with home CTA). `lib/utils.ts` with `cn()` helper (clsx + tailwind-merge). `components/providers/AppProviders.tsx` wraps root layout with ToastProvider globally.
- **05 Shop / Product Listing Page — Full UI complete** — `app/(storefront)/shop/page.tsx` with breadcrumb, promotional banner (`ShopBanner` using `/images/Hero Image.png`), filter sidebar (`FilterSidebar` with category list, price range slider, color picker, stock toggle, product tags), active filter chips (`ActiveFilters` with removable tags + clear all), sort dropdown, product grid (`ShopProductCard` following homepage pattern: image with hover zoom, category label, name, price, Add To Cart button, out-of-stock overlay), pagination (`Pagination` with compact variant matching design: numbers + next arrow only, 9 products per page). Mobile responsive with drawer-based filters. Empty state with icon + "Clear All Filters" CTA. Mock data in `components/shop/mock-data.ts` (15 products). `components/ui/pagination.tsx` extended with `variant` prop (default/compact). `lib/constants/pagination.ts`: `PRODUCTS_PER_PAGE = 9`.
- **Seed data loaded** — 12 products (all simple type, active status) across 4 categories (Fashion, Electronics, Home & Living, Beauty & Care) and 6 brands. Each product has 1 variant with stock, price, compare_price, SKU, and 1 primary image referencing `public/images/`. Run `npm run seed` to re-seed. Seed script: `scripts/seed-products.js`.
- **06 Shop Listing — Real Data + Filters/Search complete** — Shop page wired to Supabase via `repositories/product.repository.ts`. Server component (`app/(storefront)/shop/page.tsx`) reads `searchParams`, calls `getShopProducts()` and `getShopFilterOptions()`, passes data to client component `ShopPageClient`. URL search params drive all state (category, brand, price range, stock, search query, sort, page) — shareable and back-button friendly. `FilterSidebar` updated: Color filter replaced with Brand filter (loaded from DB), Tags section removed. Search bar added (ilike on product name). Sort options: Default (newest), Price Low→High, Price High→Low. `PRODUCTS_PER_PAGE = 9`. `Suspense` boundary with skeleton fallback for `useSearchParams` hydration.
- **Product card consolidated** — Single shared `components/product/ProductCard.tsx` used by all sections (ProductCards, TrendingProducts, RecentProducts, ShopPageClient). Card features: hover-reveal Add To Cart button (slides up from bottom of image on `group-hover`), out-of-stock overlay, BDT price with compare-at strikethrough, category label, product name. `components/shop/ShopProductCard.tsx` kept as thin re-export wrapper.
- **Homepage wired to Supabase** — `app/(storefront)/page.tsx` is now a server component fetching products via `getHomepageProducts()`. FeaturedProduct (first product), ProductCards (next 3), TrendingProducts (all with real category tabs), RecentProducts (all, paginated 8/page) all use real DB data. Hero, CollectionGrid, FestiveBanner, LatestNews unchanged (non-product). `ShopProduct` type extended with `description` field.
- **07 Category Pages — Full UI + Real Data complete** — `app/(storefront)/categories/[slug]/page.tsx`: server component with `generateMetadata()` for dynamic SEO. `repositories/category.repository.ts`: `getCategoryBySlug()` (fetches category + ancestors via materialized `path` field + children subcategories), `getCategoryProducts()` (products scoped to category_id, same filter/sort/pagination as shop), `getCategoryFilterOptions()` (brands + price range, no category filter since page is category-scoped). `components/category/CategoryBreadcrumb.tsx`: client component with linked ancestor path (Home > Parent > Current). `components/category/CategoryHero.tsx`: improved banner with category name, description, category label. `components/category/CategoryPageClient.tsx`: same URL-driven filter/sort/pagination pattern as ShopPageClient, adapted for `/categories/[slug]` base path. `components/category/CategoryPageFallback.tsx`: skeleton loading fallback. Subcategory cards shown before product grid when category has children. Category filter hidden from sidebar (page is already scoped). Types in `types/category.ts`.
- **Navbar updated** — now async server component fetching categories from Supabase. Nav links are Home, Shop, then all categories from DB ordered by name (dynamic, replaces hardcoded Blog/Contact).
- **ProductCard category clickable** — category label is now a `<Link>` to `/categories/{product.categorySlug}` with hover transition.
- **Real-time search** — both `ShopPageClient` and `CategoryPageClient` search inputs now use 300ms debounced `onChange` instead of form submit. Input is controlled, syncs with URL param on back/forward navigation.
- **08 Product Detail Page — Full UI + Real Data complete** — `app/(storefront)/products/[slug]/page.tsx`: server component with `generateMetadata()` for dynamic SEO. `repositories/product.repository.ts`: `getProductBySlug()` (fetches product with all variants, images, attributes via nested select), `getRelatedProducts()` (same category excluding current, limit 4). Types: `types/product.ts` (`ProductDetail`, `ProductVariant`, `ProductAttribute`, `ProductReview`, `RelatedProduct`, `FaqItem`). Components: `ProductImageGallery` (vertical thumbnails + main image, clickable thumbnails), `VariantSelector` (attribute pill buttons for Size/Color/etc.), `QuantitySelector` (+/- stepper), `ProductTabs` (Product description / Product info tabs with specs), `SizeChart` (collapsible table with Size/Chest/Length/Shoulder/Sleeve), `RelatedProducts` (4-column grid with `RelatedProductCard` matching `ProductCard` hover pattern: group-hover Add To Cart button, out-of-stock overlay, category link, name link), `FaqSection` (accordion with 5 default questions). `ProductDetailPage` client component: variant selection updates price/stock/SKU + total price line (`displayPrice * quantity`), stock status indicators (In Stock/Low Stock/Out of Stock with colored dots), quantity validation against available stock, wishlist heart toggle, breadcrumb (Home > Product Name), SKU and Categories display. ProductCard + RelatedProductCard links updated to `/products/{slug}` for all sections.
- **09 Product Detail — Real Data + Variant Logic complete** — **Reviews:** `getProductBySlug()` now fetches real reviews from `public.reviews` table with user names, computes average rating and review count. `ProductDetail` type expanded with `reviews: ProductReview[]`. `ProductTabs` gains a "Reviews (N)" tab with `ReviewSummary` (average rating + 5-star distribution bars), `ReviewList` (individual review cards with star rating, user name, date, comment), and `ReviewForm` (auth-gated star selector + comment textarea, shows "Sign In" link for guests, calls `submitReviewAction` server action). Backend: `repositories/review.repository.ts` (createReview with unique-constraint handling), `services/review.service.ts` (validation: rating 1-5, comment ≥10 chars, duplicate check), `actions/review.actions.ts` (server action with `requireAuth()`, revalidates product path on success). **Recently Viewed:** `hooks/useRecentlyViewed.ts` (localStorage helper, max 6 items). `components/product/RecentlyViewed.tsx` — client component reading from localStorage, 4-column grid of product cards excluding current product. `ProductDetailPage` saves current product to localStorage on mount. **Realtime Stock:** `hooks/useRealtimeStock.ts` — subscribes to `product_variants` UPDATE events filtered by `product_id`, maps payload to variant updates. `ProductDetailPage` uses `liveVariants` state driven by realtime, passed to `VariantSelector`, `ProductImageGallery`, and all price/stock derivations.
- **10 Cart Page — Full UI complete** — `app/(storefront)/cart/page.tsx` renders `CartPage` client component. Types: `types/cart.ts` (`CartItem`, `CartSummaryData`, `CartItemUpdate`). Components: `CartItemRow` (image, product name link, variant attributes, SKU, quantity +/- stepper with stock validation, line total, compare-at strikethrough, remove button, low stock warning), `CartSummary` (promo code input + Apply button, subtotal with item count, shipping placeholder, total with tax note, "Proceed to Checkout" primary button, "Continue Shopping" link), `EmptyCart` (ShoppingCart icon, empty text, "Continue Shopping" CTA to /shop). Mock data in `CartPage` for visual verification (2 sample items). Page layout: two-column (items left, summary right) on desktop, stacked on mobile. All styling uses CSS variables from ui-tokens.md.
- **11 Cart Logic — Guest + Authenticated complete** — (full details above). **Add to Cart wired:** Created `hooks/useAddToCart.ts` — dual guest/auth add-to-cart hook. For guests: adds to zustand store. For authenticated: calls `addItemAction` server action. Shows toast on success/error. Updated `ShopProduct` + `RelatedProduct` types with `type` and `variantId` fields. Updated all three repositories (`getShopProducts`, `getHomepageProducts`, `getRelatedProducts`, `getCategoryProducts`) to fetch `type` and map `variantId` for simple (single-variant) products. **ProductCard:** Simple products → adds directly to cart. Variable products → button shows "Select Options" and navigates to `/products/{slug}`. **RelatedProducts (RelatedProductCard):** Same pattern as ProductCard. **ProductDetailPage:** Button disabled when no variant selected (variable products). Button shows three states: "Out of Stock" / "Select Options" (variable, no variant) / "Add To Cart". On click, adds selected variant with chosen quantity. **FeaturedProduct:** Converted to client component, same simple/variable pattern as ProductCard.
- **Navbar cart count dynamic** — Created `components/cart/CartNavLink.tsx` client component. Guest: reads total quantity from zustand store (instant updates). Authenticated: receives `initialCount` from server via `getCartCount(userId)` (total quantity sum). Badge always visible (including 0). Caps display at "99+". Navbar updated to fetch authenticated cart count server-side via `repositories/cart.repository.ts:getCartCount()`.

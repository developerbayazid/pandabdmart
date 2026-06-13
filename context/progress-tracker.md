# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Catalog (Storefront)
**Last completed:** 05 Shop / Product Listing Page — Full UI
**In progress:** 06 Shop Listing — Real Data + Filters/Search

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage (Storefront)
- [x] 02 Auth
- [x] 03 Database Schema (21 tables + 79 RLS policies + storage + realtime deployed)
- [x] 04 Base Layouts & Shared UI

### Phase 2 — Catalog (Storefront)

- [x] 05 Shop / Product Listing Page — Full UI
- [ ] 06 Shop Listing — Real Data + Filters/Search
- [ ] 07 Category Pages — Full UI + Real Data
- [ ] 08 Product Detail Page — Full UI
- [ ] 09 Product Detail — Real Data + Variant Logic

### Phase 3 — Cart & Checkout

- [ ] 10 Cart Page — Full UI
- [ ] 11 Cart Logic — Guest + Authenticated
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

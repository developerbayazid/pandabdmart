# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 5 — Admin Panel
**Last completed:** 18 Product & Variant Management
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
- [x] 12 Checkout Page — Full UI
- [x] 13 SSLCommerz Payment Flow + Cash on Delivery
- [x] 14 bKash / Nagad Manual Payment Flow

### Phase 4 — Order Tracking & Customer Dashboard

- [x] 15 Order Tracking Page — Full UI + Real Data
- [x] 16 Customer Dashboard — Full UI + Real Data

### Phase 5 — Admin Panel

- [x] 17 Admin Dashboard — Full UI + Real Data
- [x] 18 Product & Variant Management
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

- **16 Customer Dashboard complete** — `/account` page with profile edit form (name, phone), address book (CRUD with default address flag), `/account/wishlist` page with grid of saved variants (Move to Cart / Remove), `/account/reviews` page with list of user's reviews (Edit/Delete with star rating selector). **Product detail wishlist button wired** — `hooks/useWishlist.ts` created (browser auth check → fetch initial state per variant → toggle via server actions, redirects unauthenticated to signin). ProductDetailPage now calls `addToWishlistAction` / `removeFromWishlistByVariantAction` / `checkWishlistAction` via the hook. Added `removeFromWishlistByVariant` to repository. Added `addToWishlist`, `checkWishlist`, `removeFromWishlistByVariant` to service. Wishlist and reviews dashboard pages have Suspense boundaries restored. Backend: `repositories/user.repository.ts`, `repositories/wishlist.repository.ts`, `repositories/address.repository.ts`, `services/user.service.ts`, `services/wishlist.service.ts`, `services/address.service.ts`, `actions/user.actions.ts`, `actions/wishlist.actions.ts`, `actions/address.actions.ts`. Extended `repositories/review.repository.ts` with `getUserReviews`, `updateReview`, `deleteReview`. Extended `services/review.service.ts` with `updateUserReview`, `deleteUserReview`. Extended `actions/review.actions.ts` with `updateReviewAction`, `deleteReviewAction`. Migration `20260616100000_add_address_book.sql` pending manual deployment. `lib/auth/get-user.ts` now includes `phone` field. Build: clean (0 TS errors, no new lint errors).

## Notes

- **01 Homepage complete** — all sections built with CSS variable-based Tailwind tokens. No raw colors.
- **02 Auth complete** — Supabase Auth: three-client pattern, proxy.ts, magic link + OAuth, callback handlers, (dashboard) and admin layouts with role-aware sidebars.
- **03 Database Schema — deployed.** 21 tables, 79 RLS policies, Realtime on orders/payments/variants, handle_new_user() trigger, storage bucket with RLS.
- **04 Base Layouts & Shared UI complete** — (storefront)/(dashboard)/admin route groups, shared UI primitives (Button, Input, Select, Badge, Card, Skeleton, Table, Pagination, Modal, Toast), AppProviders.
- **05-06 Shop Listing complete** — server component with URL-driven filters/sort/pagination, 9 products/page, debounced search, consolidated ProductCard.
- **07 Category Pages complete** — server component with dynamic SEO metadata, breadcrumb path, subcategory cards, same filter/sort/pagination as shop.
- **08-09 Product Detail complete** — image gallery, variant selector, quantity stepper, realtime stock, reviews with submit form, recently viewed.
- **10-11 Cart complete** — guest (zustand) + authenticated (Supabase) dual cart, merge on login, navbar badge, Add To Cart wired on all product cards.
- **12 Checkout Page — Full UI complete** — two-column layout matching Billing.png, ShippingForm (195 countries), ShippingZoneSelector, OrderSummary, PaymentMethodSelector (COD/bKash/Nagad), MfsInstructions. Shipping methods: Standard (৳5), Express (৳9).
- **13 SSLCommerz + Cash on Delivery complete** — Direct Supabase inserts with server-side price validation, coupon discount computation, bulk variant fetching, immediate stock decrement for COD. SSLCommerz session initiation (15s timeout), IPN webhook (validation + idempotency, 500 on failure). COD redirects to /track/[orderId]. SSLCommerz hidden from UI until API keys configured. Migration `20260615210000_cod_payment_method.sql` pending manual deployment. Build: clean.
- **14 bKash / Nagad Manual Payment Flow complete** — MFS orders create order with `payment_pending` status, reserve stock (`reserved_stock += qty`), store `txn_id` and `payment_number` on payment record. Validates TxnID + payment number required before placing order. Redirects to /track/[orderId]. Migrations `20260615210000_cod_payment_method.sql` and `20260615220000_add_payment_number.sql` deployed and tested working. Admin verification queue (Feature 20) will handle approve/reject. Build: clean.
- **15 Order Tracking Page complete** — `/track/[orderId]` and `/track` routes built. Server component at `app/(storefront)/track/` delegates to client components. Created `types/order.ts`, `services/order.service.ts`, `actions/order.actions.ts`, `lib/pdf/invoice.tsx`, `lib/pdf/render.tsx`. Repository: `getOrderById()`, `getOrderByIdWithVerification()` (uses `guest_lookup_order` RPC), `cancelOrder()` (uses `cancel_order` RPC). Components: `OrderStatusBadge` (uses shared Badge component), `OrderTimeline` (adaptive to payment method, shows cancelled state), `OrderItemsList` (with snapshots), `ShippingAddressDisplay`, `CancelOrderButton` (only pending/payment_pending), `InvoiceDownloadButton` (@react-pdf/renderer), `GuestOrderLookup` (orderId + email/phone), `OrderTrackPage` (main orchestrator with Supabase Realtime for live status updates). Customer dashboard: `/account/orders` page with full order history table, clickable order IDs linking to `/track/[orderId]`, "Track Order" sidebar link. Storefront navbar: "TRACK ORDER" link. Guest lookup: stores `customer_email` on orders, uses `guest_lookup_order` security definer RPC (bypasses RLS). Cancel: uses `cancel_order` security definer RPC (handles stock release/restore + status update atomically). Migrations: `20260615230000_add_customer_email.sql`, `20260615235000_cancel_order_rpc.sql` deployed.

- **17 Admin Dashboard complete** — `/admin/dashboard` page with full UI + real data. **Admin layout:** Pure flexbox (`h-screen flex flex-col`), no `fixed`/`absolute` positioning. Header `h-16 shrink-0`. Body `flex-1 overflow-hidden`. Sidebar `w-[280px] shrink-0` with top-level nav items: Dashboard, Products, Categories, Brands, Orders, Payments + Management section (admin only). Main content `overflow-y-auto`. **Suspense:** Sync wrapper + async content pattern with `PageSpinner` on dashboard + all product pages. **Sidebar:** Catalog group removed — Products/Categories/Brands are top-level items with `FolderTree`/`Building2`/`Package` icons. **Scrollbar fix:** No body scroll — `h-screen` outer, `overflow-hidden` on body row, internal scrolling on sidebar nav + main area. Build: clean. Repository: `repositories/admin.repository.ts` with `getDashboardStats()` (count queries with `head: true`, SQL `sum()` aggregation, `Asia/Dhaka` timezone for today stats), `getRecentOrders(10)`, `getLowStockAlerts()`, `getSalesData(30)`, `getTopProducts(5)` (uses `product_snapshot` JSONB). Service: `services/admin.service.ts` with `getDashboardData()` (parallel `Promise.all`). Components: `StatCard` (icon + label + big number + trend badge), `SalesChart` (recharts AreaChart with Monthly/Quarterly/Annually tabs + date picker, monochrome gradient), `RecentOrdersTable` (last 10 orders with status badges, customer info), `LowStockAlert` (stock <= LOW_STOCK_THRESHOLD), `TopProducts` (ranked by quantity sold), `MonthlyTarget`, `MonthlySales`, `CustomersDemographic`. `AdminDashboard` client component with Supabase Realtime on `orders` (INSERT/UPDATE — status-aware, date-checked for today stats, skips update when unchanged). **Admin layout:** `AdminSidebar` client component with `usePathname()` active state highlighting, `useState` expand/collapse on Catalog group (auto-opens when on sub-page), lucide icons per item, `NavSection` headers (Menu/Management), NEW badge on Coupons, brand header with black icon box + "PandaBD", footer branding. Fixed top header + fixed sidebar (280px). `/admin` redirects to `/admin/dashboard`. **Storefront navbar:** `AuthNavActions` accepts `isAdmin` prop — admins see "Dashboard" link, regular users see "Account". Navbar computes `isAdmin` server-side from `users` table. **Dashboard layout:** 4 stat cards (Total Revenue, Total Orders, Total Customers, Pending Orders) → SalesChart (2/3) + LowStockAlert (1/3) → RecentOrders + TopProducts. **Seed admin:** `bayazidhasabd1971@gmail.com` / `bayazidhasabd1971@gmail.com` via `scripts/seed-admin.js`. Shared utils: `formatCurrency`, `formatDate`, `getTodayStart` in `lib/utils.ts`. All migrations deployed. Build: clean (0 TS errors). Package: `recharts` installed.

- **18 Product & Variant Management complete** — `/admin/products` listing with search/filter/pagination (20/page). `/admin/products/new` and `/admin/products/[id]/edit` forms. New: `repositories/audit.repository.ts`, `services/audit.service.ts`, `types/admin-product.ts`. Extended `repositories/product.repository.ts` with `getAdminProducts`, `getAdminProductById`, `createProduct`, `updateProduct`, `softDeleteProduct`, `createVariant`, `updateVariant`, `deleteVariant`, `getCategoriesForSelect`, `getBrandsForSelect`, `getAttributesForSelect`. New `services/product.service.ts` (CRUD + audit). New `actions/product.actions.ts` (Server Actions + storefront revalidation). New `lib/upload.ts` (storage upload). Components: `ProductList` (search + filter dropdowns + table + pagination + delete confirm), `ProductForm` (name/slug/type/status/category/brand/description/specs JSON + variant cards with SKU/price/stock/active/attribute pills + `ImageUpload`). **Image fix:** Added `next.config.ts` `images.remotePatterns` for Supabase storage domain. **Storage fix:** Migration `20260617160000_add_storage_public_select.sql` — public SELECT policy on `storage.objects` (bucket was missing public read). **Review fixes:** createVariant/updateVariant now throw on attribute/image insert failure (no silent orphaned data); ProductForm checks .success on every variant operation and stops on first error; updateVariant service validates price >= 0 and stock >= 0; audit.repository uses `!inner` join (no hard-coded FK name); unused imports removed. Build: clean (0 TS errors).

- **Admin UX polish (post-Feature 18):** Sidebar restructured — collapsible Catalog group removed, Products/Categories/Brands are now top-level nav items with `FolderTree`/`Building2`/`Package` icons. Scrollbar eliminated: admin layout uses pure flexbox (`h-screen flex flex-col` + `overflow-hidden` on body row), sidebar nav scrolls internally via `overflow-y-auto`, main area scrolls internally. All admin pages have `<Suspense>` boundaries with `PageSpinner` for streaming SSR (dashboard, product listing, create, edit). All `<a>` tags replaced with `<Link>` for SPA navigation. Every route now has `<Suspense>` boundaries with `PageSpinner` fallback for streaming SSR. All pages are synchronous wrappers with inner async content components (except checkout/account/orders/admin which await auth before Suspense to preserve HTTP redirect status codes). `React.cache()` deduplication on `getCategoryBySlug` and `getProductBySlug` (prevents double-fetch from `generateMetadata` + page). Page-level ISR `revalidate`: homepage 60s, categories 120s, products 300s. Root layout: `<link rel="preconnect">` + `dns-prefetch` for Supabase URL. `OrderTrackServer` server component fetches order server-side before passing to client `OrderTrackPage` — allows Suspense spinner to show during fetch. `components/ui/PageSpinner.tsx` created as shared spinner across all pages. Build: clean (0 TS errors).

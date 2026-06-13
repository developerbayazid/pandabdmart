# Build Plan

## Core Principle

Full page UI built with mock data first — verified visually before any logic is written. Then functionality is built and wired to the UI step by step. Every feature must be visible and testable before moving to the next. No invisible backend phases.

---

## Phase 1 — Foundation

### 01 Homepage (Storefront)

Build the complete storefront homepage UI.

**UI:**

- Navbar — logo, Shop, Categories, Cart icon (with item count badge), Account/Login link
- Hero section — banner with featured promo, CTA to Shop
- Featured Categories section — grid of category cards (mock data)
- Featured/Best-selling Products section — product card grid (mock data, image, name, price, rating)
- New Arrivals section — horizontal scroll or grid (mock data)
- Brand strip — logo row of featured brands (mock data)
- Newsletter/promo banner
- Footer — links, payment method icons (bKash, Nagad, SSLCommerz), social links, contact info

**Logic:**

- Shop / category links → /shop, /categories/[slug] (routes can 404 for now)
- Cart icon → /cart (empty state acceptable)

---

### 02 Auth

Supabase Auth — email/password, magic link, Google and GitHub OAuth.

**UI:**

- Login page — email/password form, magic link option, Google OAuth button, GitHub OAuth button
- Register page — name, email, password, confirm password
- Forgot password page

**Logic:**

- Supabase Auth client/server setup (lib/supabase/client.ts, server.ts, admin.ts)
- Email/password sign up and sign in
- Magic link sign in
- Google OAuth via Supabase
- GitHub OAuth via Supabase
- OAuth callback handler (app/api/auth/callback/route.ts)
- Session management via proxy.ts (Next.js 16 — middleware.ts is deprecated, renamed to proxy.ts with exported function `proxy` instead of `middleware`)
- proxy.ts performs lightweight session presence check + redirect for (dashboard) and (admin) route groups only (cookie/session existence check, no DB calls — proxy.ts runs on Node.js but full auth/role checks here add latency to every request)
- Full auth + role verification (DB-backed) happens in layout.tsx for (dashboard) and (admin) route groups via lib/auth/require-auth.ts and require-role.ts — this is the authoritative check
- lib/auth/get-user.ts, require-auth.ts, require-role.ts
- Auto-create row in `users` table on auth.users insert (trigger)
- After login → redirect to /account (customer) or /admin/dashboard (admin/manager based on role)

---

### 03 Database Schema

All Supabase tables, RLS policies, and storage buckets created before any data is written.

**Logic:**

- Create tables in dependency order:
    1. users, categories, brands, attributes, shipping_zones, coupons
    2. products, attribute_values
    3. product_variants
    4. variant_images, variant_attribute_values, carts, wishlists, reviews
    5. cart_items
    6. orders
    7. order_items, payments, shipping_addresses, order_coupons
    8. audit_logs
- UUID primary keys on all tables
- Soft delete (`deleted_at`) on products and orders
- Self-referencing FK on categories (parent_id) for infinite-depth tree
- RLS policies on every table — customers see only their own rows (cart, orders, wishlist, reviews); admin/manager roles get elevated read/write per role
- Supabase Storage bucket for product/variant images — public read, authenticated write (admin/manager only)
- Indexes on: products.slug, products.category_id, product_variants.sku, orders.user_id, orders.status
- **Supabase Realtime enabled** on `orders`, `payments`, and `product_variants` tables (via `supabase_realtime` publication) — required for live order tracking, admin pending-payments queue, and live stock updates

---

### 04 Base Layouts & Shared UI

Set up the three route groups and shared component shells before building individual pages.

**UI:**

- (storefront) layout — navbar + footer wrapper
- (dashboard) layout — sidebar (Account, Orders, Wishlist, Reviews) + topbar
- (admin) layout — sidebar (Dashboard, Products, Categories, Brands, Orders, Customers, Coupons, Shipping, Payments, Settings) + topbar with role badge
- Shared UI primitives (components/ui/) — Button, Input, Select, Modal, Toast, Badge, Card, Table, Pagination, Skeleton/Loading
- loading.tsx, error.tsx, not-found.tsx at root

**Logic:**

- Role-based sidebar rendering — Shop Manager sees limited admin nav (no Settings/Users) vs Admin (full access)
- require-role guard applied at (admin) layout level

---

## Phase 2 — Catalog (Storefront)

### 05 Shop / Product Listing Page — Full UI

Build the complete shop listing page with mock data. No logic yet.

**UI:**

- Filter sidebar — Price range slider, Category checklist (nested), Brand checklist, Rating filter, Stock status toggle
- Sort dropdown — Price low→high, high→low, New arrivals, Popular, Best rating
- Product grid — image, name, price, compare-at price (strikethrough), rating stars, "Out of Stock" badge where applicable
- Pagination — page numbers, Previous/Next
- Active filter chips (removable) above grid
- Empty state — "No products found"

---

### 06 Shop Listing — Real Data + Filters/Search

Wire shop page to Supabase with full-text search, filters, sorting, pagination.

**Logic:**

- product.repository.ts — query products + variants + images with joins
- Full-text search on product name/description (Postgres tsvector or ilike)
- Filters: category (including nested children via path), brand, price range (min/max variant price), rating (avg from reviews), stock status (variant stock > 0)
- Sorting: price asc/desc, created_at desc (new arrivals), sold_count desc (popular), avg rating desc
- Pagination — 20 products per page, total count
- URL search params drive all filter/sort/page state (shareable links, back-button friendly)

---

### 07 Category Pages — Full UI + Real Data

**UI:**

- Category landing page — banner with category name/description, subcategory cards grid, then product grid (same layout as Shop page)
- Breadcrumb showing full category path (e.g. Electronics > Phones > Smartphones)

**Logic:**

- category.repository.ts — fetch category by slug + ancestors (for breadcrumb) + direct children
- Products filtered by category_id (and optionally descendant category IDs for "show all in this category tree")
- SSR with dynamic metadata (title, description) per category for SEO

---

### 08 Product Detail Page — Full UI

Build the complete product detail page UI with mock data.

**UI:**

- Image gallery — main image + thumbnail strip, primary image highlighted
- Product title, brand, price (with compare-at price if discounted), rating summary
- Variant selector — attribute pickers (e.g. Size, Color) that update price/image/stock on selection
- Stock status indicator (In Stock / Low Stock / Out of Stock)
- Quantity selector + Add to Cart button + Wishlist heart icon
- Tabs: Description, Specifications, Reviews
- Reviews tab — list of reviews (rating, comment, reviewer name, date), "Write a Review" button (auth-gated)
- Related/Recommended products section
- Recently Viewed section

---

### 09 Product Detail — Real Data + Variant Logic

**Logic:**

- product.repository.ts — fetch product by slug with all variants, images, attributes, specs, brand, category
- Variant selection updates displayed price, images, stock, SKU client-side (no refetch)
- Stock validation — disable Add to Cart if selected variant stock <= 0
- Reviews — fetch from reviews table, calculate average rating
- Submit review — server action, auth required, one review per user per product (enforced via unique constraint)
- Related products — same category, excluding current product (limit 4-6)
- Recently viewed — stored client-side (localStorage), last 6 products
- **Supabase Realtime** — subscribe to `product_variants` table (filtered by product_id) so stock/price updates reflect live if admin changes them while customer is viewing the page

---

## Phase 3 — Cart & Checkout

### 10 Cart Page — Full UI

**UI:**

- Cart item rows — image, name, variant attributes, unit price, quantity stepper, line total, remove icon
- Empty cart state — illustration + "Continue Shopping" CTA
- Order summary sidebar — subtotal, coupon code input + Apply button, shipping estimate placeholder, total
- "Proceed to Checkout" button

---

### 11 Cart Logic — Guest + Authenticated

**Logic:**

- store/cart.store.ts (zustand) — guest cart in localStorage
- carts/cart_items tables for authenticated users
- cart.service.ts + cart.repository.ts — add, update quantity, remove, clear
- Quantity validation against current variant stock on every change
- price_at_time captured on add (for display consistency, real price re-validated at checkout)
- api/cart/merge/route.ts — on login, merge localStorage cart into DB cart, conflict rule: database version wins
- Coupon validation — check code exists, not expired, usage_limit not exceeded, min_order met → apply discount to summary (not yet persisted)

---

### 12 Checkout Page — Full UI

**UI:**

- Step 1: Shipping Information — name, phone, address, city, district, postal code (saved addresses dropdown if logged in)
- Step 2: Shipping Zone Selection — Inside Dhaka / Outside Dhaka radio with cost shown
- Step 3: Order Summary — line items, subtotal, discount, shipping cost, grand total
- Step 4: Payment Method selection — SSLCommerz / bKash / Nagad radio cards
- bKash/Nagad selected → show payment instructions panel + TxnID + payment number input fields
- Place Order button

**Logic:**

- Auth check — guest must log in/register before reaching checkout (per customer flow)
- Address book — save/select from saved addresses (authenticated users)
- Shipping cost pulled from shipping_zones table based on selection

---

### 13 SSLCommerz Payment Flow

**Logic:**

- checkout.service.ts — initiate SSLCommerz session, redirect customer to gateway
- api/webhooks/sslcommerz/route.ts — IPN webhook handler
    - Verify signature/validation with SSLCommerz validation API
    - Idempotency check (gateway_ref / txn_id uniqueness)
    - Supabase RPC (transaction): create order → create order_items → atomic stock decrement → create payment record
    - Update order status to Paid
    - Trigger confirmation email
    - Return 200 OK to SSLCommerz
- On success → redirect customer to /track/[orderId]

---

### 14 bKash / Nagad Manual Payment Flow

**Logic:**

- On order placement with manual MFS — create order (status: payment_pending), create payment record (status: pending) with submitted TxnID + payment number
- Stock reservation — reserve selected variant stock (reserved_stock += qty) for 15-30 min
- Scheduled function (Supabase Edge Function / pg_cron) — release expired reservations, cancel orders past hold window
- Order confirmation page → /track/[orderId] showing "Pending Verification" status

---

## Phase 4 — Order Tracking & Customer Dashboard

### 15 Order Tracking Page — Full UI + Real Data

**UI:**

- Order summary — order number, date, status badge, items list with snapshots
- Order timeline — visual progress (Pending → Paid → Processing → Shipped → Delivered)
- Shipping address display
- Download Invoice button (PDF)
- Cancel Order button — visible only when status = Pending

**Logic:**

- order.repository.ts — fetch order + items + payment + shipping_address by order ID
- Guest order lookup — by order ID + email/phone verification
- Cancel order — only allowed when status = Pending, sets status = Cancelled, releases any stock reservation
- Invoice PDF — @react-pdf/renderer, server action, streamed download
- **Supabase Realtime** — subscribe to `orders` table (filtered by order id) so status badge and timeline update live without refresh when admin changes order status or MFS payment is approved/rejected

---

### 16 Customer Dashboard — Full UI + Real Data

**UI:**

- Account overview — profile info edit form (name, phone, avatar)
- Address book — list/add/edit/delete addresses
- Order history — table of past orders, status badges, "View Details" links
- Wishlist — grid of saved variants, "Move to Cart" / remove
- My Reviews — list of reviews user has written, edit/delete

**Logic:**

- All wired to Supabase, RLS-scoped to current user
- Wishlist add/remove from product pages reflected here
- Move to Cart — adds variant to cart, removes from wishlist (optional: keep in wishlist)
- **Supabase Realtime** — subscribe to `orders` table (filtered by user_id) so order history status badges update live as admin updates statuses

---

## Phase 5 — Admin Panel

### 17 Admin Dashboard — Full UI + Real Data

**UI:**

- Stat cards — Total Sales (daily/monthly), Orders Count, Revenue, Top-selling Products, Low Stock Alerts
- Recent Orders table
- Sales chart (recharts) — revenue over time

**Logic:**

- Aggregation queries — sales totals, order counts, top products by sold_count
- Low stock — variants where stock <= low_stock_threshold
- **Supabase Realtime** — subscribe to `orders` table (no filter, admin/manager role) so stat cards and recent orders table update live as new orders come in

---

### 18 Product & Variant Management

**UI:**

- Products table — search, filter by category/brand/status, bulk actions
- Create/Edit Product form — name, slug (auto-generate, editable), category, brand, description, specs (JSON or relational fields), images upload
- Variant management — add/edit variants per product, attribute combinations, price, compare price, stock, SKU, images

**Logic:**

- product.actions.ts — CRUD via repositories, image upload to Supabase Storage
- Soft delete (deleted_at) instead of hard delete
- Every create/update/delete logs to audit_logs (actor_id, action, entity_type, entity_id, meta)

---

### 19 Category & Brand Management

**UI:**

- Category tree view — drag to reorder/reparent, create/edit/delete with parent selector
- Brand list — create/edit/delete

**Logic:**

- Self-referencing category tree CRUD, path recalculation on move
- Audit log on every change

---

### 20 Order Management & MFS Verification

**UI:**

- Orders table — filter by status, search by order ID/customer
- Order detail view — items, customer info, payment info, status update dropdown
- Pending Payments queue — TxnID, payment number, amount, Approve/Reject buttons

**Logic:**

- Status update — enforce valid transitions (Pending → Paid → Processing → Shipped → Delivered, or Pending → Cancelled)
- MFS Approve — Supabase RPC: mark payment verified, atomic stock decrement, order status = Paid, trigger confirmation email
- MFS Reject — order status = Cancelled, release stock reservation
- Refund handling — mark payment as refunded, audit logged
- **Supabase Realtime** — subscribe to `orders` and `payments` tables (no filter, admin/manager role) so new orders and new pending MFS payments appear in the queue live without manual refresh

---

### 21 Coupons & Shipping Zones Management

**UI:**

- Coupons table — create/edit/delete, fields: code, type (percentage/fixed/free shipping), value, min order, expiry, usage limit
- Shipping zones — create/edit zones and costs

**Logic:**

- coupon.repository.ts, shipping.repository.ts (CRUD)
- Audit log on changes

---

### 22 Customer & User Management

**UI:**

- Users table — search, filter by role
- User detail — view profile, order history, change role, deactivate

**Logic:**

- Role updates restricted to Admin only (not Shop Manager)
- Audit log on role changes and deactivation

---

### 23 Audit Log Viewer

**UI:**

- Audit logs table — actor, action, entity type, entity ID, timestamp, expandable meta JSON
- Filter by actor, action type, date range

**Logic:**

- audit.repository.ts — paginated query with filters
- Admin-only access

---

## Phase 6 — Notifications, SEO & Polish

### 24 Email Notifications

**Logic:**

- notification.service.ts + Resend integration
- Email templates (emails/): order-confirmation, payment-success, shipment-update, delivery-confirmation
- Triggered from: order creation, payment verification, admin status updates

---

### 25 SEO & Performance Pass

**Logic:**

- Dynamic metadata (generateMetadata) for product, category, and home pages
- SEO-friendly slugs verified across products/categories
- Image optimization via Supabase Storage/CDN
- ISR or caching strategy for category/product pages
- Lazy loading for product grids

---

### 26 Reviews Moderation (Optional)

**UI:**

- Admin reviews table — approve/hide reviews, filter by rating/product

**Logic:**

- Optional `status` field on reviews (pending/approved/hidden) if moderation required
- Audit logged

---

## Feature Count

| Phase                                | Features |
| ------------------------------------ | -------- |
| Phase 1 — Foundation                 | 4        |
| Phase 2 — Catalog (Storefront)       | 5        |
| Phase 3 — Cart & Checkout            | 5        |
| Phase 4 — Order Tracking & Dashboard | 2        |
| Phase 5 — Admin Panel                | 7        |
| Phase 6 — Notifications, SEO, Polish | 3        |
| **Total**                            | **26**   |

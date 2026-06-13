# Project Overview

## About the Project

pandabdmart is a single-vendor ecommerce platform built for the Bangladesh market. Customers browse a catalog of simple and variable products, add items to a cart (as a guest or signed in), and check out using either automated payment (SSLCommerz) or manual mobile financial services (bKash/Nagad) with admin-side verification. Admins and shop managers run the store through a dedicated admin panel — managing products, categories, brands, orders, payments, coupons, shipping zones, and customers — with every administrative action recorded in an audit log.

The storefront is fully SEO-optimized with server-rendered product and category pages, and order tracking/status updates are reflected live via Supabase Realtime.

---

## The Problem It Solves

Running a small-to-mid scale online store in Bangladesh means dealing with a payment landscape that mixes automated gateways (SSLCommerz) with manual mobile payments (bKash/Nagad) that require human verification — plus inventory management that must prevent overselling during that verification window, localized shipping (Dhaka vs outside Dhaka), and an admin team that needs visibility and accountability over every change made to the store.

pandabdmart solves this with a single integrated system: real-time inventory with stock reservation during manual payment verification, a streamlined admin verification queue, role-based access for Admin vs Shop Manager, and full audit logging — without needing a heavier multi-vendor platform like a Laravel-based marketplace.

---

## Pages

```
/                          → Storefront homepage
/shop                       → Product listing (search, filter, sort, pagination)
/categories/[slug]          → Category landing page + products
/products/[slug]            → Product detail page
/cart                        → Cart page
/checkout                    → Checkout flow (shipping, payment)
/track/[orderId]            → Order tracking page (guest + authenticated)
/auth/login                  → Login (email/password, magic link, Google, GitHub)
/auth/register               → Register
/auth/forgot-password        → Forgot password

/account                     → Customer dashboard (profile, addresses)
/account/orders              → Order history
/account/wishlist             → Wishlist
/account/reviews              → My reviews

/admin/dashboard              → Admin overview (sales, orders, low stock)
/admin/products                → Product & variant management
/admin/categories               → Category tree management
/admin/brands                   → Brand management
/admin/orders                    → Order management + status updates
/admin/payments                  → Pending MFS (bKash/Nagad) verification queue
/admin/customers                  → User management
/admin/coupons                     → Coupon management
/admin/shipping                     → Shipping zone management
/admin/settings                      → Store settings
/admin/audit-logs                     → Audit log viewer
```

---

## Navigation

**Storefront navbar** — logo, Shop, Categories, Cart icon (with item count badge), Account/Login.

**Customer dashboard** — sidebar with Account, Orders, Wishlist, Reviews.

**Admin panel** — sidebar with Dashboard, Products, Categories, Brands, Orders, Payments, Customers, Coupons, Shipping, Settings, Audit Logs. Shop Manager sees a restricted subset (no Customers/Settings/Audit Logs — Admin only).

---

## Core User Flow

### Homepage

- Hero banner, featured categories, featured/best-selling products, new arrivals, brand strip, newsletter signup
- Logged out users see Login link in navbar; logged in users see Account link

### Anonymous Shopping → Checkout

- Visitor browses, searches, filters products
- Adds items to cart — stored in localStorage as guest cart
- Proceeds to checkout → must log in or register
- On login, guest cart merges into Supabase cart (database version wins on conflict)
- Completes shipping info, selects shipping zone (Inside Dhaka / Outside Dhaka), selects payment method

### Payment — Automated (SSLCommerz)

- Customer redirected to SSLCommerz gateway, completes payment
- IPN webhook verifies payment, creates order + order items, atomically decrements stock, creates payment record, sends confirmation email
- Customer redirected to order tracking page

### Payment — Manual (bKash/Nagad)

- Customer shown payment instructions, pays externally, submits TxnID + payment number
- Order created with status "Payment Pending", stock reserved (15-30 min hold)
- Admin/Shop Manager reviews and approves or rejects in the Payments queue
- Approved → atomic stock decrement, order status = Paid, confirmation email sent
- Rejected → order cancelled, stock reservation released

### Order Tracking & Cancellation

- Customer (or guest via order ID + email/phone) views order status, timeline, shipping address, downloads PDF invoice
- Customer can cancel only while order status = Pending
- After payment, cancellation requires contacting support / admin action
- Order status updates reflect live via Supabase Realtime (no manual refresh)

### Admin Operations

- Admin/Shop Manager logs in, role checked, redirected to admin dashboard
- Manage products (simple & variable), variants, categories (infinite-depth tree), brands
- Manage orders — update status through valid transitions, verify MFS payments
- Manage coupons, shipping zones, customers (Admin only), and view audit logs (Admin only)
- Every create/update/delete on products, categories, brands, orders, payments, users, and coupons is recorded in `audit_logs`

---

## Data Architecture

### Catalog Data

- Lives in `products`, `product_variants`, `categories`, `brands`, `attributes`, `attribute_values`, `variant_attribute_values`, `variant_images`
- Soft-deleted (`deleted_at`) rather than hard-deleted
- Product specs stored as flexible JSON where structure varies by category

### Cart Data

- Guest cart — localStorage only, never touches the database
- Authenticated cart — `carts` + `cart_items` tables, RLS-scoped to `user_id`
- Merged on login (database version wins on conflicting items)

### Order Data

- `orders`, `order_items`, `payments`, `shipping_addresses`, `order_coupons`
- `order_items` stores `product_snapshot`, `variant_snapshot`, and `sku_snapshot` — order history remains accurate even if the underlying product/variant is later edited or deleted
- Order status changes drive Supabase Realtime updates to customer-facing tracking pages

### Audit Data

- `audit_logs` table — every admin/manager action (stock updates, price changes, order status changes, payment approvals, role changes) recorded with `actor_id`, `action`, `entity_type`, `entity_id`, and a `meta` JSONB payload
- Read access restricted to Admin role

---

## Features In Scope

- Storefront with homepage, shop listing, category pages, product detail pages
- Full-text search, filtering (price, category, brand, rating, stock status), sorting
- Simple and variable products (attribute-based variants/SKUs)
- Infinite-depth nested categories with SEO-friendly slugs
- Guest cart (localStorage) + authenticated cart (Supabase) with merge-on-login
- Checkout with shipping zone selection (Inside Dhaka / Outside Dhaka)
- SSLCommerz automated payment with IPN webhook handling
- bKash/Nagad manual payment with TxnID submission and admin verification
- Stock reservation (15-30 min hold) during manual payment verification
- Atomic stock decrement on order confirmation (no overselling)
- Order tracking page (guest + authenticated) with live status updates via Supabase Realtime
- PDF invoice generation and download
- Customer dashboard — profile, address book, order history, wishlist, reviews
- Product reviews and ratings
- Admin dashboard — sales stats, revenue, top products, low stock alerts (live via Realtime)
- Admin product/variant/category/brand management
- Admin order management with valid status transitions
- Admin MFS payment verification queue (live via Realtime)
- Coupon system (percentage, fixed, free shipping) with min order/expiry/usage limits
- Shipping zone management
- Customer/user management with role updates (Admin only)
- Audit log viewer (Admin only)
- Email notifications (order confirmation, payment success, shipping updates) via Resend
- Role-based access control — Admin, Shop Manager, Customer — enforced via Supabase RLS

---

## Features Out of Scope

- Multi-vendor marketplace (architecture is multi-vendor-ready, but not built in this version)
- Mobile app
- Subscription/recurring billing
- WhatsApp notifications (noted as a future upgrade)
- Weight-based shipping calculation (fixed rate per zone only for now)
- AI-based product recommendations (rule-based only)
- District-based shipping expansion beyond Inside/Outside Dhaka
- Live chat / customer support widget
- Affiliate or referral program
- Gift cards

---

## Target User

**Customer** — a shopper in Bangladesh browsing and purchasing products, paying via card/SSLCommerz or bKash/Nagad, expecting clear order tracking and timely email updates.

**Shop Manager** — handles day-to-day catalog and order operations, including manual payment verification and inventory updates, without access to user role management or store-wide settings.

**Admin** — full control over the store including user roles, audit logs, and all Shop Manager capabilities.

---

## Success Criteria

- A customer can browse, search, filter, add to cart as a guest, and complete checkout (both SSLCommerz and bKash/Nagad paths) without errors
- Guest cart merges correctly into the authenticated cart on login, with database version winning conflicts
- Stock is never oversold — atomic decrement and reservation/hold logic both verified under concurrent requests
- Admin can verify or reject a manual MFS payment and the order status updates correctly, with stock reservation released on rejection
- Order tracking page reflects status changes in real time without manual refresh
- All RLS policies correctly restrict customers to their own cart/orders/wishlist/reviews while giving Admin/Shop Manager appropriate elevated access
- Every admin action that should be audited appears correctly in `audit_logs`
- Category tree supports infinite depth and breadcrumbs render correctly at any depth
- Product and category pages are server-rendered with correct SEO metadata
- PDF invoices generate and download correctly for completed orders
- Email notifications (order confirmation, payment success, shipping update) send correctly via Resend

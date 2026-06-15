# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 4 — Order Tracking & Customer Dashboard
**Last completed:** 15 Order Tracking Page
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
- **15 Order Tracking Page complete** — `/track/[orderId]` and `/track` routes built. Server component at `app/(storefront)/track/` delegates to client components. Created `types/order.ts`, `services/order.service.ts`, `actions/order.actions.ts`, `lib/pdf/invoice.tsx`, `lib/pdf/render.tsx`. Repository: `getOrderById()`, `getOrderByIdWithVerification()` (uses `guest_lookup_order` RPC), `cancelOrder()` (uses `cancel_order` RPC). Components: `OrderStatusBadge` (uses shared Badge component), `OrderTimeline` (adaptive to payment method, shows cancelled state), `OrderItemsList` (with snapshots), `ShippingAddressDisplay`, `CancelOrderButton` (only pending/payment_pending), `InvoiceDownloadButton` (@react-pdf/renderer), `GuestOrderLookup` (orderId + email/phone), `OrderTrackPage` (main orchestrator with Supabase Realtime for live status updates). Customer dashboard: `/account/orders` page with full order history table, clickable order IDs linking to `/track/[orderId]`, "Track Order" sidebar link. Storefront navbar: "TRACK ORDER" link. Guest lookup: stores `customer_email` on orders, uses `guest_lookup_order` security definer RPC (bypasses RLS). Cancel: uses `cancel_order` security definer RPC (handles stock release/restore + status update atomically). Migrations: `20260615230000_add_customer_email.sql`, `20260615235000_cancel_order_rpc.sql` deployed. Build: clean (0 TS errors).

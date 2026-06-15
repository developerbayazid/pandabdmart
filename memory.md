# Memory — Feature 15: Order Tracking Page

Last updated: 2026-06-15 23:28

## What was built

**Feature 15: Order Tracking Page** — complete with all sub-features:

New files:
- `types/order.ts` — Order, OrderPayment, OrderShipping, OrderItemSnapshot, OrderLookupInput types
- `services/order.service.ts` — getOrder, guestLookup, cancelUserOrder, generateInvoice; shared `mapDbRowToOrder()` helper
- `actions/order.actions.ts` — getOrderAction, guestLookupAction, cancelOrderAction, downloadInvoiceAction
- `lib/pdf/invoice.tsx` — @react-pdf/renderer InvoicePDF component (Document, Page, View, Text)
- `lib/pdf/render.tsx` — renderInvoiceBuffer() helper wrapping renderToBuffer
- `components/order/OrderStatusBadge.tsx` — uses shared Badge component via status-to-variant mapping
- `components/order/OrderTimeline.tsx` — linear timeline; adapts to payment method; cancelled state
- `components/order/OrderItemsList.tsx` — renders items from snapshots with prices
- `components/order/ShippingAddressDisplay.tsx` — read-only address display
- `components/order/CancelOrderButton.tsx` — client component; confirm dialog; calls cancelOrderAction
- `components/order/InvoiceDownloadButton.tsx` — client component; blob download from server action
- `components/order/GuestOrderLookup.tsx` — orderId + email or phone lookup form
- `components/order/OrderTrackPage.tsx` — main orchestrator; 3 states (loading/guest lookup/order display); Supabase Realtime
- `components/order/TrackPageClient.tsx` — wraps GuestOrderLookup for /track page
- `app/(storefront)/track/page.tsx` — standalone lookup page
- `app/(storefront)/track/[orderId]/page.tsx` — server component + Suspense
- `app/(dashboard)/account/orders/page.tsx` — customer order history with clickable full UUID IDs → /track/[orderId]
- `supabase/migrations/20260615230000_add_customer_email.sql` — adds customer_email to orders + guest_lookup_order RPC
- `supabase/migrations/20260615235000_cancel_order_rpc.sql` — cancel_order security definer RPC

Modified:
- `repositories/order.repository.ts` — added getOrderById(), getOrderByIdWithVerification() (uses RPC), cancelOrder() (uses RPC); added customerEmail to CreateOrderInput; stores customer_email on order creation; COD cancel restores stock
- `services/checkout.service.ts` — passes customerEmail to repository
- `components/layout/Navbar.tsx` — added "TRACK ORDER" link between SHOP and categories
- `app/(dashboard)/layout.tsx` — added "Track Order" sidebar link
- `lib/utils.ts` — formatCurrency updated to use ৳ symbol
- `components/order/OrderItemsList.tsx` / `OrderTrackPage.tsx` — import formatCurrency from lib/utils
- `components/order/OrderStatusBadge.tsx` — uses shared Badge component (not standalone)
- `context/progress-tracker.md` / `context/ui-registry.md` — updated
- `package.json` — added @react-pdf/renderer

## Decisions made

- **Guest lookup uses security definer RPC** (`guest_lookup_order`) — bypasses RLS since guests can't read users.email or orders (RLS `orders_read_own` requires `auth.uid()`)
- **Cancel uses security definer RPC** (`cancel_order`) — customers can't UPDATE orders due to `orders_admin_update` RLS; RPC handles stock release/restore + status update atomically
- **customer_email stored on orders table** — needed for guest email verification since users table is RLS-protected
- **COD cancel restores stock** — previously missing; now handled in both the RPC and the JS fallback
- **OrderStatusBadge uses shared Badge component** — maps OrderStatus to Badge variant strings (success/warning/error/info)
- **formatCurrency centralized in lib/utils.ts** — uses ৳ prefix; removed 3 local duplicates

## Problems solved

- Guest lookup failed because `users!inner(email)` join was blocked by RLS — fixed with `guest_lookup_order` security definer RPC that bypasses RLS
- Cancel order failed because `orders_admin_update` RLS blocked customer UPDATE — fixed with `cancel_order` security definer RPC
- COD order cancellation never restored decremented stock — fixed in both the RPC and JS fallback
- Duplicated DB-to-Order mapping across 3 service functions — extracted to `mapDbRowToOrder()` helper
- formatCurrency defined in 3 places with inconsistent implementation — centralized in lib/utils.ts

## Current state

- Phase 1: 01–04 ✓
- Phase 2: 05–09 ✓
- Phase 3: 10–14 ✓
- Phase 4: 15 ✓ (Order Tracking Page complete)
- Build: clean (0 TS errors)
- Routes: /track (lookup), /track/[orderId] (tracking), /account/orders (order history)
- Storefront navbar: TRACK ORDER link present
- Dashboard sidebar: Orders + Track Order links present
- Guest lookup: works via guest_lookup_order RPC (migration 20260615230000 deployed)
- Cancel order: works via cancel_order RPC (migration 20260615235000 deployed)
- Realtime: order status updates live on tracking page
- Invoice: PDF download via @react-pdf/renderer

## Next session starts with

Phase 4 — Feature 16: Customer Dashboard — Full UI + Real Data:
- `/account` page: profile form (name, phone, avatar upload)
- `/account/wishlist` page: grid of saved variants with "Move to Cart" / remove
- `/account/reviews` page: list of user's reviews with edit/delete
- Address book under `/account`: list/add/edit/delete addresses
- Real data from Supabase, RLS-scoped to current user

## Open questions

- SSLCommerz API keys needed to un-hide SSLCommerz from payment selector
- Wishlist and Reviews pages are placeholder routes (sidebar links exist but pages don't)

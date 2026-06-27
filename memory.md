# Memory — Dashboard Profit Analytics + Payment Sync + Logo Fix

Last updated: 2026-06-27 23:28 +06

## What was built

- **Migration deployed:** `20260627000000_add_purchase_price_profit_tracking.sql` — adds nullable `purchase_price` to `product_variants` (inventory-transfer products) and `order_items` (snapshot at sale). RPCs `transfer_inventory_to_product` and `create_order` carry purchase_price. No DEFAULT on variants — admin-created products get NULL.
- **Profit queries restored:** `getProfitStats()`, `getTopProducts()`, `getSalesData()` all re-added `purchase_price` to `.select()` and `.not('purchase_price', 'is', null)` filter now that column exists. Cost/profit compute from real data.
- **ProfitOverview** — revenue/cost/profit/margin cards with today row and trend.
- **TopCustomers** — ranked by total spend (paid/delivered/completed only).
- **SalesChart** — dual revenue/profit area lines (profit line hidden when cost=0).
- **TopProducts** — profit column per row, links to /admin/products.
- **Payment status sync:** `updateOrderStatus` in `services/order.service.ts` now updates `payments` record to `verified` (verified_by + verified_at) when order status changes to "paid".
- **Verify/Fail buttons** now visible for ALL payment methods (removed `isMfs` guard in `OrderDetailView.tsx`).
- **Sidebar logo removed:** `AdminSidebar` no longer renders logo or store name at top. Header (`app/admin/layout.tsx`) now shows logo image from settings (fallback: Package icon + storeName).
- `AdminSidebar` type cleaned up — `logoUrl` and `storeName` props removed.

## Decisions made

- Revenue in ProfitOverview uses `qty * unit_price` from order_items (line-item subtotal), intentionally differs from StatCard's `grand_total` (includes shipping/discounts).
- Revenue in dashboard stats (`getDashboardStats`) uses `select('grand_total')` + JS `.reduce()` to avoid PostgREST aggregate response parsing issues.
- Cost/profit queries filter `.not('purchase_price', 'is', null)` — only inventory-sourced products contribute to profit. Admin-created products (purchase_price IS NULL) excluded.
- getTopCustomers filters to `['paid', 'delivered', 'completed']` only — excludes unpaid/ghost orders.
- getProfitStats uses 12-month bound. getTopProducts uses 90-day bound.

## Problems solved

- **Revenue always 0:** `.select('sum(grand_total)')` + `.single()` returned `{ sum: { grand_total } }` object but code used `[0]?.sum?.grand_total`. Switched to `select('grand_total')` + JS reduce.
- **Top Customers 0:** `public.users` has no `email` column — removed from join select. Status filter was `.not('cancelled')` (included unpaid orders), fixed to `.in('paid','delivered','completed')`.
- **Top Products / profit 0 before deploy:** `purchase_price` in `.select()` caused query errors before column existed — removed from all selects until migration deployed.
- **Profit/Loss overlapping revenue in SalesChart:** `profit = revenue - 0 = revenue` → hardcoded cost/profit to 0 pre-deploy, restored post-deploy.
- **Payment record stuck at pending:** `updateOrderStatus` only updated `orders.status`, not `payments.status`. Added payment record update when newStatus = 'paid'.
- **Verify buttons hidden for COD:** `isMfs` (bkash/nagad) guard blocked COD payment verification.
- **Duplicate logo:** Sidebar showed store name/logo AND header showed it — removed sidebar version.

## Current state

- Migration deployed. purchase_price column exists. Profit/loss computes from live data.
- Revenue, profit, customer, and top products dashboard widgets all working.
- Order detail: changing status to "paid" updates both order AND payment record.
- Verify/Fail buttons work for bKash, Nagad, and COD.
- Header shows logo image (or Package icon + storeName fallback). Sidebar has no logo.
- All payment methods visible in `/admin/payments` with tabs.
- Timezone: Bangladesh (`Asia/Dhaka`) for daily stats. Integration tests use UTC.

## Next session starts with

Either Feature 26 (Email Notifications) or Feature 26 (SEO & Performance Pass) — whichever is prioritized. Review `context/build-plan.md` for specifics.

## Open questions

- Purchase_price was added to order_items via the create_order RPC and direct inserts in order.repository.ts. Verify the addOrderItem / admin edit paths also capture purchase_price correctly.
- Confirm all RPC `create_order` references carry purchase_price from variant to order_items row for all payment methods (COD, SSLCommerz, bKash, Nagad).

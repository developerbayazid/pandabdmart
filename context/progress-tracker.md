# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 1 — Foundation
**Last completed:** 02 Auth
**In progress:** 03 Database Schema

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage (Storefront)
- [x] 02 Auth
- [ ] 03 Database Schema
- [ ] 04 Base Layouts & Shared UI

### Phase 2 — Catalog (Storefront)

- [ ] 05 Shop / Product Listing Page — Full UI
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
- Database schema (03) must be completed before any feature in Phase 2 onward — all subsequent features depend on tables existing with correct RLS policies.
- Supabase Realtime must be enabled on `orders`, `payments`, and `product_variants` as part of 03 — required by features 09, 15, 16, 17, 20.
- `proxy.ts` (not `middleware.ts`) handles route-group session checks per architecture.md — created as part of 02. Admin layout lives at `app/admin/layout.tsx` (not inside a route group) so URLs resolve as `/admin/dashboard`, `/admin/products`, etc.

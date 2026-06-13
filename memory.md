# Memory — Phase 1 Foundation: Features 01-03 Complete

Last updated: 2026-06-13 21:27

## What was built

**Feature 03 Database Schema — fully deployed and verified on Supabase.**

**Deployed to Supabase (`gufkxeuuzkyaqtavrcpr`):**
- 21 tables, 79 RLS policies, 24 indexes, 11 updated_at triggers
- `handle_new_user()` trigger on `auth.users` INSERT (SECURITY DEFINER, auto-creates `public.users` row, backfills existing users)
- Realtime: `orders`, `payments`, `product_variants` added to `supabase_realtime` publication
- `product-images` storage bucket: public read, admin/manager write via RLS on `storage.objects`
- 4 helper functions: `set_updated_at()`, `is_admin()`, `is_admin_or_manager()`, `handle_new_user()`

**New files:**
- `supabase/migrations/20260613150000_initial_schema.sql` — full schema (751 lines)
- `supabase/migrations/20260613155000_storage_rls.sql` — storage bucket RLS policies
- `supabase/config.toml` — CLI configuration
- `lib/constants/inventory.ts` — `STOCK_RESERVATION_MINUTES = 20`, `LOW_STOCK_THRESHOLD = 5`
- `lib/constants/order.ts` — `ORDER_STATUSES` tuple + `OrderStatus` type
- `lib/constants/roles.ts` — `ROLES` tuple + `Role` type
- `lib/constants/pagination.ts` — `PRODUCTS_PER_PAGE = 20`, `ORDERS_PER_PAGE = 20`
- `scripts/apply-migration.js` — pg-based migration runner (uses pooler connection)

**Prior features (01-02 recap):**
- Feature 01: Full homepage with all 10 sections (Navbar, Hero, FeaturedProduct, ProductCards, TrendingProducts, CollectionGrid, FestiveBanner, RecentProducts, LatestNews, Footer)
- Feature 02: Auth — email/password + magic link, `proxy.ts`, signin/register/forgot-password pages, auth callback handlers, dashboard + admin layouts, role-aware nav, auth guards

## Decisions made

- **No OAuth providers** — Google/GitHub removed. Email/password + magic link only.
- **Email confirmation disabled** in Supabase for dev (free-tier limit). Must re-enable before production.
- **`proxy.ts` uses `getSession()`** — lightweight cookie check, no DB round-trip. Full role checks in layouts.
- **Admin layout at `app/admin/`** — not a route group, so URLs resolve as `/admin/dashboard`.
- **Single migration** for all 21 tables — interdependent schema, must exist atomically.
- **Pooler connection** — `aws-1-ap-southeast-1.pooler.supabase.com:6543` (Supavisor transaction mode). Note: `aws-1` not `aws-0`.
- **Explicit triggers** — named triggers per table instead of dynamic loop (pg_trigger.objid doesn't exist on this PG version).

## Problems solved

- **IPv6-only DB** — Supabase database hostname only has AAAA record. Solved via Supavisor pooler (IPv4).
- **Wrong pooler host prefix** — `aws-0` didn't work, correct is `aws-1` for this project.
- **pg_trigger.objid column missing** — PostgreSQL 15+ changed system catalog. Replaced DO loop with 11 named CREATE TRIGGER statements.
- **HeroSection arrow overlap** — arrows moved to viewport edges with z-30, circular background.
- **useSearchParams() hydration** — wrapped in Suspense boundaries.
- **Admin route URL** — moved from `(admin)` route group to `app/admin/` to preserve `/admin/dashboard` URLs.

## Current state

- **Phase 1 — Foundation:** 01 Homepage, 02 Auth, 03 Database Schema — all complete and verified.
- **Next: 04 Base Layouts & Shared UI**
- TypeScript + ESLint + next build all pass clean.
- All Tailwind classes use CSS variables from `globals.css` `@theme` block — no raw hex or Tailwind color classes.
- No `shadcn/ui` installed — all forms use custom monochrome token system.
- Routes: `/`, `/signin`, `/register`, `/forgot-password`, `/auth/callback`, `/account`, `/admin/dashboard`, `/api/auth/callback`.

## Next session starts with

**Feature 04 — Base Layouts & Shared UI** (see `context/build-plan.md`):

1. (storefront) layout — navbar + footer wrapper
2. (dashboard) layout — sidebar (Account, Orders, Wishlist, Reviews) + topbar
3. (admin) layout — sidebar with role-aware rendering (Admin full, Shop Manager restricted)
4. Shared UI components: Button, Input, Select, Modal, Toast, Badge, Card, Table, Pagination, Skeleton/Loading
5. Root loading.tsx, error.tsx, not-found.tsx

## Open questions

- Whether to install `shadcn/ui` for Feature 04 or build all primitives with the monochrome token system.

## Pooler connection string

```
postgresql://postgres.gufkxeuuzkyaqtavrcpr:{password}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
```

# Memory — Suspense Streaming + Performance Pass

Last updated: 2026-06-16 21:00

## What was built

**Suspense streaming on every route** — all 15 pages converted to synchronous wrappers with `<Suspense>` boundaries. Inner async content components handle data fetching.

New files:
- `components/ui/PageSpinner.tsx` — shared spinner (w-6 h-6 border spinner, used by all Suspense fallbacks)
- `components/order/OrderTrackServer.tsx` — async server component, fetches order via `getOrderAction` before passing to client display

Modified files:
- `app/(storefront)/page.tsx` — synchronous wrapper, `HomeContent` inner async, `revalidate = 60` ISR
- `app/(storefront)/shop/page.tsx` — synchronous, `ShopContent` inner async, PageSpinner fallback
- `app/(storefront)/categories/[slug]/page.tsx` — synchronous, `CategoryContent` inner async, PageSpinner fallback, `revalidate = 120` ISR
- `app/(storefront)/products/[slug]/page.tsx` — synchronous, `ProductContent` inner async, PageSpinner fallback, `revalidate = 300` ISR
- `app/(storefront)/cart/page.tsx` — synchronous, `CartContent` inner async
- `app/(storefront)/checkout/page.tsx` — async (awaits `requireAuth` before Suspense to preserve HTTP 307), `CheckoutContent` inner async
- `app/(storefront)/track/page.tsx` — synchronous, wraps `TrackPageClient` in Suspense
- `app/(storefront)/track/[orderId]/page.tsx` — synchronous, passes `params` Promise to `<OrderTrackServer>` inside Suspense
- `app/(dashboard)/account/page.tsx` — async (awaits `requireAuth` before Suspense)
- `app/(dashboard)/account/orders/page.tsx` — async (awaits `getUser` + redirect before Suspense), `OrdersContent` receives `userId`
- `app/admin/dashboard/page.tsx` — async (awaits `getUser` + redirect before Suspense)
- `repositories/category.repository.ts` — `getCategoryBySlug` wrapped in `React.cache()`
- `repositories/product.repository.ts` — `getProductBySlug` wrapped in `React.cache()`
- `app/layout.tsx` — added `<link rel="preconnect">` + `dns-prefetch` for Supabase URL
- `components/order/OrderTrackPage.tsx` — accepts optional `initialOrder`/`initialError`/`orderIdOverride` props, skips client fetch when pre-provided
- `context/progress-tracker.md` — updated

## Decisions made

- **Suspense pattern**: pages are synchronous wrappers, async data fetching in inner `*Content` components — allows Next.js streaming: shell + spinner sent immediately, data fills in when ready
- **Auth/redirect pages stay async**: checkout, account, orders, admin dashboard await auth check before Suspense to preserve HTTP 307/redirect status codes (Next.js degrades `redirect()` inside Suspense to client-side meta redirect)
- **notFound() inside Suspense accepted**: category and product pages use synchronous wrappers with `notFound()` inside the inner async component — produces HTTP 200 + `noindex` meta instead of 404, but search engines treat identically for indexing. Trade-off: immediate streaming UX over HTTP status code purity
- **React.cache() for per-request dedup**: `getCategoryBySlug` and `getProductBySlug` wrapped in `cache()` — prevents duplicate DB calls when both `generateMetadata` and page component fetch the same data
- **Page-level ISR for caching**: homepage 60s, categories 120s, products 300s — caches full page HTML, instant response on warm cache
- **unstable_cache NOT used**: Supabase server client uses `cookies()` internally — incompatible with `unstable_cache()`. Removed after it caused homepage crash
- **Preconnect for Supabase**: reduces DNS+TCP+TLS handshake latency on first request

## Problems solved

- `unstable_cache()` on repository functions caused homepage crash: `cookies()` called inside cached scope — removed all `unstable_cache` wrappers, kept only page-level ISR
- Track/[orderId] Suspense didn't trigger: `OrderTrackPage` is a `'use client'` component that renders immediately (no suspend). Fixed by creating `OrderTrackServer` async server component that fetches data before passing to client — Suspense now shows spinner during server fetch
- Shop/category pages had broken Suspense: pages were `async`, blocking first byte. Fixed by making them synchronous wrappers
- Review flagged `redirect()`/`notFound()` inside Suspense as degrading HTTP status codes — resolved for redirect pages by keeping auth check outside Suspense; accepted noindex tradeoff for notFound pages

## Current state

- All 15 routes have Suspense boundaries, 0 TS errors
- Streaming works: shell + spinner sent immediately, data fills in
- Page-level ISR active on homepage, categories, products
- Supabase preconnect in root layout
- `React.cache()` deduplication on category/product slug lookups
- Track order page: server fetches order, Suspense shows spinner, client gets pre-fetched data with realtime
- Phase 1-4 (features 01-15): complete
- Phase 4 feature 16 (Customer Dashboard): not started

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

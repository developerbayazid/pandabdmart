# Memory — Feature 16: Customer Dashboard + Wishlist Integration

Last updated: 2026-06-16 22:57

## What was built

**Feature 16 — Customer Dashboard (Full UI + Real Data):**

New files:
- `supabase/migrations/20260616100000_add_address_book.sql` — standalone `addresses` table with user-scoped RLS
- `repositories/user.repository.ts` — `updateProfile(userId, data)`
- `repositories/wishlist.repository.ts` — `getWishlist`, `addToWishlist`, `removeFromWishlist`, `removeFromWishlistByVariant`, `isInWishlist`
- `repositories/address.repository.ts` — full CRUD with default-address mutual-exclusion logic
- `services/user.service.ts`, `services/wishlist.service.ts`, `services/address.service.ts`
- `actions/user.actions.ts`, `actions/wishlist.actions.ts`, `actions/address.actions.ts`
- `components/dashboard/ProfileForm.tsx` — `useActionState` form with name/phone fields, success/error banners
- `components/dashboard/AddressBook.tsx` — inline add/edit forms with hidden `addressId` field, default badge, delete with `Loader2` spinner
- `components/dashboard/WishlistContent.tsx` — responsive grid (1-2-3 cols), Move to Cart (adds + removes from wishlist), Remove with error/loading states
- `components/dashboard/ReviewsContent.tsx` — review cards with interactive star rating selector on edit, delete with loading state
- `app/(dashboard)/account/reviews/page.tsx`, `app/(dashboard)/account/wishlist/page.tsx` — both with Suspense boundaries

Modified files:
- `app/(dashboard)/account/page.tsx` — ProfileForm + AddressBook sections, uses `getAddresses` repository
- `repositories/review.repository.ts` — added `getUserReviews`, `updateReview`, `deleteReview`
- `services/review.service.ts` — added `updateUserReview`, `deleteUserReview`
- `actions/review.actions.ts` — added `updateReviewAction`, `deleteReviewAction`
- `lib/auth/get-user.ts` — `AuthUser` type now includes `phone` field, added `console.error` in catch block
- `app/globals.css` — unchanged

**Wishlist button on product detail page (bug fix):**

New files:
- `hooks/useWishlist.ts` — checks browser auth via `createClient().auth.getSession()`, fetches initial per-variant wishlist state via `checkWishlistAction`, toggles via `addToWishlistAction` / `removeFromWishlistByVariantAction`, redirects unauthenticated users to `/signin`

Modified files:
- `components/product/ProductDetailPage.tsx` — replaced dead `useState(false)` toggle with `useWishlist(selectedVariant?.id)`, shows `Loader2` spinner, disabled state when no variant selected
- `actions/wishlist.actions.ts` — added `addToWishlistAction`, `checkWishlistAction`, `removeFromWishlistByVariantAction`
- `services/wishlist.service.ts` — added `addToWishlist`, `checkWishlist`, `removeFromWishlistByVariant`
- `repositories/wishlist.repository.ts` — added `removeFromWishlistByVariant(userId, variantId)`

## Decisions made

- **Pages use direct Supabase queries, not repositories.** During review, pages were changed to use repositories, but this caused the wishlist/reviews pages to not fetch data (likely due to Suspense interaction or cookie context in repository call chain). Reverted to direct queries matching the orders page pattern. Repository functions remain available for server actions.
- **Wishlist toggle per variant.** The `useWishlist` hook tracks wishlist state per selected variant ID — re-fetches when the user changes variant selection on the product detail page.
- **Variant-based wishlist remove.** Added `removeFromWishlistByVariant` (by userId + variantId) alongside the existing ID-based `removeFromWishlist`, since the product page doesn't have the wishlist entry ID.
- **Hidden form field for edit addressId.** AddressBook passes `addressId` via `<input type="hidden">` instead of closure to avoid stale closure issues with `useActionState`.
- **Suspense restored on wishlist/reviews dashboard pages.** Outer page is synchronous wrapper, inner `*Async` component handles auth + data fetch.

## Problems solved

- **Wishlist tab showed empty because no data was ever saved.** The heart button on `ProductDetailPage` was a local `useState` toggle with zero backend — clicking it changed a visual boolean only. Fixed by creating `useWishlist` hook wired to real server actions.
- **`unstable_cache` incompatible with Supabase cookies.** Confirmed from previous session — page-level ISR used instead.
- **Review flagged direct Supabase calls in pages.** Fixed by using repositories, but this introduced a regression (wishlist tab not fetching). Reverted to direct queries while keeping repositories for actions. The root cause of the regression wasn't fully isolated — likely a Suspense + async repository call chain issue with cookie context.

## Current state

- Phases 1-4 (features 01-16): complete
- All 15 routes have Suspense boundaries, 0 TS errors
- Page-level ISR on homepage (60s), categories (120s), products (300s)
- `React.cache()` on category/product slug lookups
- Wishlist button on product detail page: fully functional (check → toggle → DB)
- Wishlist dashboard page: shows real data, Move to Cart / Remove work
- Reviews dashboard page: shows real data, Edit / Delete work
- Address book: full CRUD on account page
- Profile edit: works (name, phone)
- Build: clean

## Next session starts with

Phase 5 — Feature 17: Admin Dashboard (Full UI + Real Data). Stat cards (sales, orders, revenue, top products, low stock alerts), recent orders table, sales chart (recharts), live data via Supabase Realtime on `orders` table.

Pending manual deployment:
- Migration `20260616100000_add_address_book.sql`
- Migration `20260615210000_cod_payment_method.sql`

## Open questions

- SSLCommerz API keys needed to un-hide SSLCommerz from payment selector
- Why did the repository-based page pattern cause the wishlist tab to not fetch data? Exact root cause of the Suspense + repository interaction wasn't fully diagnosed.

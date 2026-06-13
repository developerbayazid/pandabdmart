# Memory — Phase 1 Foundation: Auth Complete, Ready for Database Schema

Last updated: 2026-06-13 20:24

## What was built

**Feature 02 Auth — complete end-to-end with sign out, auth guards, and redirect enforcement.**

**New files:**
- `lib/supabase/client.ts`, `server.ts`, `admin.ts` — three-client Supabase pattern
- `lib/auth/get-user.ts` — server-side auth user + role fetch (resilient to missing `users` table — defaults to `customer` role until Feature 03 creates the schema)
- `lib/auth/require-auth.ts` — server guard, redirects to `/signin` if unauthenticated
- `lib/auth/require-role.ts` — server guard, redirects to `/` if wrong role
- `proxy.ts` — Next.js 16 proxy (replaces `middleware.ts`), lightweight `getSession()` check (no DB calls), redirects unauthenticated from `/account` and `/admin` paths
- `app/(storefront)/signin/page.tsx` — sign in page with password mode and magic link mode toggle, hash fragment error detection, redirects authenticated users to `/account`
- `app/(storefront)/register/page.tsx` — email/password sign up, redirects authenticated users
- `app/(storefront)/forgot-password/page.tsx` — password reset, redirects authenticated users
- `app/(storefront)/auth/callback/page.tsx` — client-side magic link callback, listens for `onAuthStateChange`
- `app/api/auth/callback/route.ts` — OAuth + magic link callback, handles `code` (OAuth via `exchangeCodeForSession`) and `token_hash` (magic link via `verifyOtp`)
- `app/(dashboard)/layout.tsx` + `app/(dashboard)/account/page.tsx` — customer dashboard with sidebar (Account, Orders, Wishlist, Reviews) + sign out server action
- `app/admin/layout.tsx` + `app/admin/dashboard/page.tsx` — admin layout with role-aware sidebar (Admin sees full nav; Shop Manager sees limited nav) + sign out server action, URL resolves as `/admin/dashboard`
- `components/auth/SignOutButton.tsx` — client sign out component
- `components/auth/AuthNavActions.tsx` — auth-aware navbar actions (Sign In icon for guests, Account + Sign Out for authenticated)

**Modified files:**
- `components/layout/Navbar.tsx` — replaced static `/signin` link with `<AuthNavActions />`
- `.env.local` — renamed `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `NEXT_PUBLIC_SUPABASE_ANON_KEY`, added `SUPABASE_SERVICE_ROLE_KEY`
- `package.json` — added `@supabase/ssr` and `@supabase/supabase-js`

## Decisions made

- **No OAuth providers** — Google and GitHub OAuth buttons removed from signin page. Purely email/password + magic link auth. OAuth can be re-added later if needed.
- **Email confirmation disabled** in Supabase for development (avoids free-tier rate limit of 3 emails/hour). Must be re-enabled + custom SMTP configured before production.
- **`proxy.ts` uses `getSession()`** (local cookie check, no server round-trip) — full `getUser()` validation happens in layout.tsx for protected routes.
- **Sign out in layouts** uses server actions (`form action={signOut}`) since layouts are server components.
- **Auth redirects** — signed-in users hitting `/signin`, `/register`, `/forgot-password` get `router.replace()`'d to `/account`. Proxy handles unauthenticated users on protected routes.
- **Admin layout** lives at `app/admin/` (not `app/(admin)/`) — the route group was causing URLs like `/dashboard` instead of `/admin/dashboard`.

## Problems solved

- **`useSearchParams()` hydration error** — Next.js 16 requires `useSearchParams()` to be wrapped in `<Suspense>`. Fixed by splitting signin page into `<SignInForm>` (inner, uses `useSearchParams`) and `<SignInPage>` (wrapper with `<Suspense>`). Same fix applied to `auth/callback` page.
- **Hash fragment error display** — Supabase auth errors arrive as URL hash (`#error=...` or `#error_description=...`). Signin page reads hash in `useEffect` and displays decoded error to user.
- **OAuth `unexpected_failure`** — Google OAuth code exchange failed because Google Cloud Console redirect URI wasn't configured. Explanation provided, but OAuth was removed anyway.
- **Email rate limit** — Supabase free tier limits auth emails to 3/hour. Fixed by disabling email confirmation in Supabase dashboard for dev.
- **Admin route URL** — `(admin)` route group stripped `/admin` from URL paths (made `/dashboard` instead of `/admin/dashboard`). Fixed by moving to `app/admin/` without route group.

## Current state

- **Phase 1 — Foundation:** Features 01 (Homepage) and 02 (Auth) complete.
- **Next: 03 Database Schema** — all Supabase tables, RLS policies, storage buckets, and Supabase Realtime publication.
- `users` table does NOT exist yet — `get-user.ts` handles this gracefully.
- `app/page.tsx` still renders all homepage sections directly (no route group).
- No `shadcn/ui` installed — all auth forms use custom monochrome token system.
- Build passes clean: TypeScript, ESLint, and `next build` all green.
- Routes: `/`, `/signin`, `/register`, `/forgot-password`, `/auth/callback`, `/account`, `/admin/dashboard`, `/api/auth/callback`.

## Next session starts with

**Feature 03 — Database Schema.** Create Supabase migration with all tables in dependency order:

1. `users`, `categories`, `brands`, `attributes`, `shipping_zones`, `coupons`
2. `products`, `attribute_values`
3. `product_variants`
4. `variant_images`, `variant_attribute_values`, `carts`, `wishlists`, `reviews`
5. `cart_items`
6. `orders`
7. `order_items`, `payments`, `shipping_addresses`, `order_coupons`
8. `audit_logs`

Plus: RLS policies on all tables, Supabase Storage bucket for product/variant images, indexes, and **Supabase Realtime** enabled on `orders`, `payments`, `product_variants`. The database trigger on `auth.users` insert → auto-create `users` row is also part of 03.

## Open questions

- Whether to use Supabase CLI migrations (`npx supabase migration new`) or run SQL directly via the dashboard.
- `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local` — verify it still works before Feature 03.
- Email confirmation must be re-enabled + custom SMTP (Resend or other) before production use.

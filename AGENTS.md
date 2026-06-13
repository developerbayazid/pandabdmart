<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version (Next.js 16.2) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices — in particular, `middleware.ts` is deprecated in favor of `proxy.ts` (exported function is `proxy`, not `middleware`).

<!-- END:nextjs-agent-rules -->

## Read Before Anything Else

Read in this exact order before any implementation:

1. context/project-overview.md
2. context/architecture.md
3. context/ui-tokens.md
4. context/ui-rules.md
5. context/ui-registry.md
6. context/code-standards.md
7. context/library-docs.md
8. context/build-plan.md
9. context/progress-tracker.md

## Rules That Never Change

- Never use hardcoded hex values or raw Tailwind color classes
- This project has no brand accent color — black & white (monochrome) palette only, with functional colors restricted to status badges/stock indicators per ui-tokens.md
- Update `progress-tracker.md` and `ui-registry.md` after every feature
- Before any third party library — load its installed skill first, then read `context/library-docs.md` for project-specific rules
- All order-affecting operations (create order, decrement stock, verify payment) run inside a single Supabase RPC transaction — never as separate sequential queries
- Every admin/manager mutation (products, categories, brands, orders, payments, coupons, shipping zones, user roles) writes an `audit_logs` entry
- If the same problem persists after one corrective prompt — stop immediately and run /recover

## Available Skills

- `/architect` — before any complex feature. Think before building.
- `/imprint` — after any new UI component. Capture patterns.
- `/review` — before demo or when something feels off.
- `/recover` — when something breaks after one failed correction.
- `/remember save` — when a feature spans multiple sessions.
- `/remember restore` — when returning after a multi-session feature.

<!-- SUPABASE:START -->

## Supabase backend

This project uses [Supabase](https://supabase.com): an open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, and realtime through one platform.

- **Skills:** these Supabase skills are installed for supported coding agents. Reach for them before implementing any Supabase feature instead of guessing the API — `@supabase/ssr` patterns change between versions and training data may be outdated:
    - `supabase`: app code with the `@supabase/ssr` and `@supabase/supabase-js` clients (database CRUD, auth, storage, edge functions, realtime).
    - `supabase-cli`: backend and infrastructure via the `supabase` CLI (projects, SQL, migrations, RLS policies, storage buckets, edge functions, secrets, deploys).
    - `supabase-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
    - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `supabase/config.toml` and project linkage. Never hardcode or commit keys — `SUPABASE_SERVICE_ROLE_KEY` must never be prefixed `NEXT_PUBLIC_`.

Key patterns:

- Three separate client instances — browser (`lib/supabase/client.ts`), server (`lib/supabase/server.ts`), and service-role/admin (`lib/supabase/admin.ts`, webhooks/Edge Functions only). Never mix them — see architecture.md.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- Multi-step writes (orders, payment verification) go through `rpc()` calling a `security definer` Postgres function — never sequential `.insert()`/`.update()` calls for operations that must be atomic.
- For storage uploads, persist the returned public URL back to the relevant table (e.g. `variant_images.url`).
- Realtime subscriptions (`orders`, `payments`, `product_variants`) always cleaned up with `supabase.removeChannel(channel)` in a `useEffect` cleanup.
  <!-- SUPABASE:END -->

<!-- PAYMENTS:START -->

## Payment providers

- **SSLCommerz** — automated gateway. Session initiation in `lib/payments/sslcommerz.ts`, IPN webhook at `app/api/webhooks/sslcommerz/route.ts`. Always validate server-to-server via `validationserverAPI.php` before trusting IPN data. Always check idempotency (`gateway_ref`/`txn_id`) before processing. Webhook returns `200 OK` after validation succeeds even on internal errors — see code-standards.md.
- **bKash / Nagad** — manual MFS, no API/SDK. Customer submits TxnID + payment number; admin approves/rejects via `/admin/payments`. Both flows go through `payment.service.ts` RPCs (`approve_manual_payment`, `reject_manual_payment`) — never plain `UPDATE` statements.
- Check `context/library-docs.md` for full patterns before implementing either flow.
  <!-- PAYMENTS:END -->

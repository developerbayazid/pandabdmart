# Architecture

## Stack

| Layer                          | Tool                                    | Purpose                                                 |
| ------------------------------ | --------------------------------------- | ------------------------------------------------------- |
| Framework                      | Next.js 16.2 (App Router)               | Full stack framework                                    |
| Auth + DB + Storage + Realtime | Supabase (PostgreSQL)                   | Entire backend — auth, database, file storage, realtime |
| Automated payments             | SSLCommerz                              | Card/mobile banking gateway via IPN webhook             |
| Manual payments                | bKash / Nagad                           | MFS — customer submits TxnID, admin verifies            |
| Email                          | Resend                                  | Order/payment/shipping notification emails              |
| PDF generation                 | @react-pdf/renderer                     | Order invoice PDF rendering                             |
| Styling                        | Tailwind CSS + shadcn/ui                | UI components and styling                               |
| Client state                   | Zustand                                 | Guest cart, auth state, UI state                        |
| Language                       | TypeScript strict                       | Throughout                                              |
| Hosting                        | Vercel (app) + Supabase Cloud (backend) |                                                         |

---

## Folder Structure

```
/
├── AGENTS.md
├── proxy.ts                                → Next.js 16 proxy (replaces middleware.ts)
├── context/
│   ├── project-overview.md
│   ├── architecture.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   ├── library-docs.md
│   ├── build-plan.md
│   └── progress-tracker.md
├── app/
│   ├── layout.tsx                          → Root layout
│   ├── page.tsx                            → Homepage
│   ├── loading.tsx / error.tsx / not-found.tsx
│   │
│   ├── (storefront)/
│   │   ├── shop/page.tsx                  → Product listing
│   │   ├── categories/[slug]/page.tsx     → Category landing page
│   │   ├── products/[slug]/page.tsx       → Product detail page
│   │   ├── cart/page.tsx                  → Cart page
│   │   ├── checkout/page.tsx              → Checkout flow
│   │   ├── track/[orderId]/page.tsx       → Order tracking page
│   │   └── auth/
│   │       ├── login/page.tsx
│   │       ├── register/page.tsx
│   │       └── forgot-password/page.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                     → Customer dashboard layout
│   │   ├── account/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── wishlist/page.tsx
│   │   └── reviews/page.tsx
│   │
│   ├── (admin)/
│   │   ├── layout.tsx                     → Admin layout, role-gated
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── brands/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── payments/page.tsx              → MFS verification queue
│   │   ├── customers/page.tsx
│   │   ├── coupons/page.tsx
│   │   ├── shipping/page.tsx
│   │   ├── settings/page.tsx
│   │   └── audit-logs/page.tsx
│   │
│   └── api/
│       ├── auth/callback/route.ts         → OAuth callback handler
│       ├── webhooks/sslcommerz/route.ts   → SSLCommerz IPN webhook
│       ├── cart/merge/route.ts            → Guest → DB cart merge
│       ├── upload/route.ts                → Image upload to Supabase Storage
│       └── email/route.ts                 → Email send trigger (Resend)
│
├── actions/
│   ├── auth.actions.ts
│   ├── cart.actions.ts
│   ├── checkout.actions.ts
│   ├── order.actions.ts
│   ├── product.actions.ts
│   └── admin.actions.ts
│
├── services/
│   ├── auth.service.ts
│   ├── cart.service.ts
│   ├── checkout.service.ts
│   ├── order.service.ts
│   ├── inventory.service.ts
│   ├── payment.service.ts
│   ├── coupon.service.ts
│   ├── shipping.service.ts
│   ├── review.service.ts
│   ├── wishlist.service.ts
│   ├── audit.service.ts
│   ├── reservation.service.ts
│   └── notification.service.ts
│
├── repositories/
│   ├── product.repository.ts
│   ├── category.repository.ts
│   ├── order.repository.ts
│   ├── cart.repository.ts
│   ├── payment.repository.ts
│   ├── user.repository.ts
│   ├── inventory.repository.ts
│   ├── coupon.repository.ts
│   ├── shipping.repository.ts
│   ├── review.repository.ts
│   ├── wishlist.repository.ts
│   └── audit.repository.ts
│
├── components/
│   ├── ui/                                → shadcn/ui components only
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── product/
│   ├── category/
│   ├── cart/
│   ├── checkout/
│   ├── order/
│   ├── dashboard/
│   └── admin/
│
├── lib/
│   ├── auth/
│   │   ├── get-user.ts
│   │   ├── require-auth.ts
│   │   └── require-role.ts
│   ├── supabase/
│   │   ├── client.ts                      → Browser client
│   │   ├── server.ts                      → Server client (server actions, RSC)
│   │   └── admin.ts                       → Service-role client (webhooks, admin ops)
│   ├── payments/
│   │   ├── sslcommerz.ts
│   │   ├── bkash.ts
│   │   └── nagad.ts
│   ├── pdf/
│   ├── email/
│   ├── inventory/
│   │   └── reservation.ts                 → Stock hold helpers
│   ├── validations/
│   ├── constants/
│   └── utils/
│
├── hooks/
├── store/
│   ├── cart.store.ts                      → Zustand — guest cart (localStorage)
│   ├── auth.store.ts
│   └── ui.store.ts
│
├── types/
├── emails/
│   ├── order-confirmation.tsx
│   ├── payment-success.tsx
│   └── shipment-update.tsx
│
├── public/
└── supabase/
    ├── migrations/
    ├── functions/
    │   └── release-stock-holds/           → Edge Function — expires stock reservations
    └── seed.sql
```

---

## System Boundaries

| Folder          | Owns                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `app/`          | Pages and API routes only. No business logic — delegates to actions/services.                             |
| `actions/`      | Server Actions for UI-triggered mutations. Calls services, never repositories directly.                   |
| `services/`     | All business logic — validation, orchestration, multi-step operations (e.g. checkout, stock reservation). |
| `repositories/` | All Supabase queries. Nothing outside this layer touches the Supabase client for data access.             |
| `components/`   | UI only. No data fetching, no direct Supabase calls.                                                      |
| `lib/`          | Third-party client initialization, payment provider wrappers, and shared utilities only.                  |
| `store/`        | Client-side state (Zustand) — guest cart, UI state. Never the source of truth for authenticated data.     |
| `types/`        | TypeScript types shared across the project.                                                               |

---

## Data Flow

### UI Mutations (Server Actions)

```
User interaction in component
        ↓
Server Action in actions/
        ↓
services/*.service.ts (business logic, validation)
        ↓
repositories/*.repository.ts (Supabase read/write)
        ↓
Revalidate or redirect
```

### Storefront Page Rendering (Server Components)

```
Browser
        ↓
Next.js Server Component (app/(storefront)/...)
        ↓
repositories/*.repository.ts
        ↓
Supabase (with RLS)
        ↓
Rendered HTML
        ↓
Browser
```

### Cart Merge on Login

```
localStorage cart (store/cart.store.ts)
        ↓
POST /api/cart/merge
        ↓
cart.service.ts — conflict resolution (database version wins)
        ↓
cart.repository.ts — upsert cart_items
        ↓
Merged cart returned
```

### Order Creation + Atomic Stock Decrement

```
Checkout
        ↓
checkout.service.ts
        ↓
Supabase RPC (transaction):
    Create order
    Create order_items
    Decrement variant stock
    Create payment record
        ↓
COMMIT
```

### SSLCommerz IPN Webhook

```
SSLCommerz
        ↓
/api/webhooks/sslcommerz/route.ts
        ↓
Verify signature + idempotency check (gateway_ref / txn_id)
        ↓
payment.service.ts → order.service.ts
        ↓
Supabase RPC (transaction) — same as above
        ↓
notification.service.ts → Resend → confirmation email
        ↓
200 OK to SSLCommerz
```

### bKash / Nagad Manual Verification

```
Customer submits TxnID + payment number
        ↓
order.service.ts — create order (status: payment_pending), create payment (status: pending)
        ↓
inventory.service.ts — reserve stock (reserved_stock += qty, 15-30 min hold)
        ↓
Admin opens Payments queue → Approve / Reject
        ↓
Approve → Supabase RPC: mark verified, atomic stock decrement, order status = paid
Reject  → order status = cancelled, release stock reservation
        ↓
notification.service.ts → Resend → confirmation email (on approve)
```

### Email Delivery (Resend)

```
Order created / payment verified / status updated
        ↓
notification.service.ts
        ↓
Resend API
        ↓
Customer email
```

### PDF Invoice Streaming

```
Customer clicks Download Invoice
        ↓
Server Action
        ↓
order.repository.ts — fetch order + items + payment + shipping_address
        ↓
@react-pdf/renderer — renderToBuffer()
        ↓
Stream response → browser download
```

### Realtime Updates

```
orders / payments / product_variants tables (Realtime publication enabled)
        ↓
Supabase Realtime channel subscription (client component)
        ↓
UI updates live — order status badges, admin payments queue, stock indicators
```

---

## Database Schema (Supabase / PostgreSQL)

### `users`

| Column     | Type        | Notes                           |
| ---------- | ----------- | ------------------------------- |
| id         | uuid        | References auth.users (PK)      |
| role       | text        | admin / shop_manager / customer |
| full_name  | text        |                                 |
| phone      | text        |                                 |
| avatar_url | text        |                                 |
| created_at | timestamptz |                                 |
| updated_at | timestamptz |                                 |

### `categories`

| Column    | Type | Notes                              |
| --------- | ---- | ---------------------------------- |
| id        | uuid |                                    |
| parent_id | uuid | Self-reference — nullable for root |
| name      | text |                                    |
| slug      | text | SEO-friendly, unique               |
| path      | text | Materialized path for breadcrumbs  |

### `brands`

| Column | Type | Notes  |
| ------ | ---- | ------ |
| id     | uuid |        |
| name   | text |        |
| slug   | text | Unique |

### `products`

| Column      | Type        | Notes                           |
| ----------- | ----------- | ------------------------------- |
| id          | uuid        |                                 |
| category_id | uuid        | References categories           |
| brand_id    | uuid        | References brands               |
| slug        | text        | SEO-friendly, unique            |
| type        | text        | simple / variable               |
| status      | text        | draft / active / archived       |
| name        | text        |                                 |
| description | text        |                                 |
| specs       | jsonb       | Flexible product specifications |
| deleted_at  | timestamptz | Soft delete                     |

### `attributes` / `attribute_values`

| Table            | Column                  | Type             | Notes           |
| ---------------- | ----------------------- | ---------------- | --------------- |
| attributes       | id, name                | uuid, text       |                 |
| attribute_values | id, attribute_id, value | uuid, uuid, text | FK → attributes |

### `product_variants`

| Column         | Type    | Notes                                   |
| -------------- | ------- | --------------------------------------- |
| id             | uuid    | References products                     |
| product_id     | uuid    |                                         |
| sku            | text    | Unique                                  |
| price          | numeric |                                         |
| compare_price  | numeric | Optional, for showing discounts         |
| stock          | integer |                                         |
| reserved_stock | integer | Held during manual payment verification |
| sold_count     | integer |                                         |
| is_active      | boolean |                                         |

### `variant_images` / `variant_attribute_values`

| Table                    | Columns                                       |
| ------------------------ | --------------------------------------------- |
| variant_images           | id, variant_id, url, is_primary, sort_order   |
| variant_attribute_values | variant_id, attribute_value_id (N:M junction) |

### `carts` / `cart_items`

| Table      | Columns                                          |
| ---------- | ------------------------------------------------ |
| carts      | id, user_id (1:1 with users)                     |
| cart_items | id, cart_id, variant_id, quantity, price_at_time |

### `wishlists`

| Column     | Type | Notes                 |
| ---------- | ---- | --------------------- |
| id         | uuid |                       |
| user_id    | uuid | FK → users            |
| variant_id | uuid | FK → product_variants |

### `reviews`

| Column     | Type    | Notes         |
| ---------- | ------- | ------------- |
| id         | uuid    |               |
| user_id    | uuid    | FK → users    |
| product_id | uuid    | FK → products |
| rating     | integer | 1-5           |
| comment    | text    |               |

### `orders`

| Column         | Type        | Notes                                                                                      |
| -------------- | ----------- | ------------------------------------------------------------------------------------------ |
| id             | uuid        |                                                                                            |
| user_id        | uuid        | FK → users                                                                                 |
| status         | text        | pending / payment_pending / paid / processing / shipped / delivered / cancelled / refunded |
| payment_method | text        | sslcommerz / bkash / nagad                                                                 |
| subtotal       | numeric     |                                                                                            |
| shipping_cost  | numeric     |                                                                                            |
| discount_total | numeric     |                                                                                            |
| grand_total    | numeric     |                                                                                            |
| created_at     | timestamptz |                                                                                            |

### `order_items`

| Column           | Type    | Notes                         |
| ---------------- | ------- | ----------------------------- |
| id               | uuid    |                               |
| order_id         | uuid    | FK → orders                   |
| variant_id       | uuid    | FK → product_variants         |
| quantity         | integer |                               |
| unit_price       | numeric |                               |
| discount_applied | numeric |                               |
| product_snapshot | jsonb   | Product data at time of order |
| variant_snapshot | jsonb   | Variant data at time of order |
| sku_snapshot     | text    |                               |

### `payments`

| Column      | Type        | Notes                                   |
| ----------- | ----------- | --------------------------------------- |
| id          | uuid        |                                         |
| order_id    | uuid        | FK → orders                             |
| status      | text        | pending / verified / failed / refunded  |
| amount      | numeric     |                                         |
| currency    | text        | BDT                                     |
| gateway_ref | text        | SSLCommerz transaction reference        |
| txn_id      | text        | bKash/Nagad transaction ID              |
| verified_by | uuid        | FK → users (admin/manager who verified) |
| verified_at | timestamptz |                                         |

### `shipping_addresses`

| Column      | Type | Notes       |
| ----------- | ---- | ----------- |
| id          | uuid |             |
| order_id    | uuid | FK → orders |
| name        | text |             |
| phone       | text |             |
| address     | text |             |
| city        | text |             |
| district    | text |             |
| postal_code | text |             |

### `coupons` / `order_coupons`

| Table         | Columns                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------ |
| coupons       | id, code, type (percentage/fixed/free_shipping), value, min_order, usage_limit, expires_at |
| order_coupons | order_id, coupon_id, discount_amount (N:M junction)                                        |

### `shipping_zones`

| Column | Type    | Notes                        |
| ------ | ------- | ---------------------------- |
| id     | uuid    |                              |
| name   | text    | Inside Dhaka / Outside Dhaka |
| cost   | numeric |                              |

### `audit_logs`

| Column      | Type        | Notes                                    |
| ----------- | ----------- | ---------------------------------------- |
| id          | uuid        |                                          |
| actor_id    | uuid        | FK → users                               |
| action      | text        | e.g. "product.update", "payment.approve" |
| entity_type | text        | e.g. "product", "order", "payment"       |
| entity_id   | uuid        |                                          |
| meta        | jsonb       | Before/after values or relevant context  |
| created_at  | timestamptz |                                          |

---

## Supabase Storage

| Bucket         | Path                             | Contents                   | Access                                           |
| -------------- | -------------------------------- | -------------------------- | ------------------------------------------------ |
| product-images | products/{product_id}/{filename} | Product and variant images | Public read, authenticated write (admin/manager) |

---

## Authentication

- Provider: Supabase Auth
- Methods: Email/password, magic link, Google OAuth, GitHub OAuth
- Public routes: `/`, `/shop`, `/categories/*`, `/products/*`, `/auth/*`, `/track/*`
- Protected routes: `(dashboard)` route group (customer account), `(admin)` route group (admin/shop_manager only)
- `proxy.ts` (Next.js 16 — replaces deprecated `middleware.ts`, exports `proxy` not `middleware`) performs lightweight session-presence check and redirect for `(dashboard)` and `(admin)` route groups. Runs on Node.js. Does **not** perform DB-backed role checks.
- Full auth + role verification happens in `layout.tsx` for `(dashboard)` and `(admin)` via `lib/auth/require-auth.ts` and `lib/auth/require-role.ts` — this is the authoritative check
- On login → redirect to `/account` (customer) or `/admin/dashboard` (admin/shop_manager, based on `users.role`)
- A database trigger auto-creates a row in `users` on `auth.users` insert

---

## Supabase Client Pattern

Three separate Supabase client instances — never mix them:

```typescript
// lib/supabase/client.ts
// Browser-side — used in client components for auth state, realtime subscriptions
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

// lib/supabase/server.ts
// Server-side — used in Server Components, Server Actions, route handlers
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options),
                    );
                },
            },
        },
    );
};

// lib/supabase/admin.ts
// Service-role client — webhooks, admin RPCs, stock reservation cron only
// NEVER expose to the browser, NEVER use for user-scoped requests
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const createAdminClient = () =>
    createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
    );
```

---

## Realtime Subscription Pattern

```typescript
// Example: subscribe to order status changes (order tracking page)
const supabase = createClient();

useEffect(() => {
    const channel = supabase
        .channel(`order-${orderId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${orderId}`,
            },
            (payload) => {
                setOrderStatus(payload.new.status);
            },
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}, [orderId]);
```

Realtime is enabled on `orders`, `payments`, and `product_variants` via the `supabase_realtime` publication (set up in migration 03).

---

## Payment Patterns

### SSLCommerz — session initiation

```typescript
// lib/payments/sslcommerz.ts
const response = await fetch(`${SSLCOMMERZ_BASE_URL}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        store_id: process.env.SSLCOMMERZ_STORE_ID!,
        store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
        total_amount: grandTotal.toString(),
        currency: 'BDT',
        tran_id: orderId,
        success_url: `${baseUrl}/api/webhooks/sslcommerz`,
        fail_url: `${baseUrl}/api/webhooks/sslcommerz`,
        cancel_url: `${baseUrl}/checkout`,
        ipn_url: `${baseUrl}/api/webhooks/sslcommerz`,
        // customer + product info fields...
    }),
});
const data = await response.json();
// data.GatewayPageURL — redirect customer here
```

### SSLCommerz — IPN validation (webhook)

```typescript
// app/api/webhooks/sslcommerz/route.ts
// Always validate server-to-server before trusting the IPN payload
const validation = await fetch(
    `${SSLCOMMERZ_BASE_URL}/validator/api/validationserverAPI.php?` +
        `val_id=${valId}&store_id=${storeId}&store_passwd=${storePasswd}&format=json`,
);
const result = await validation.json();
if (result.status !== 'VALID' && result.status !== 'VALIDATED') {
    return NextResponse.json({ error: 'Invalid transaction' }, { status: 400 });
}
// Idempotency check before proceeding
const existing = await paymentRepository.findByGatewayRef(result.tran_id);
if (existing?.status === 'verified') {
    return NextResponse.json({ status: 'already processed' });
}
```

---

## Invariants

Rules the AI agent must never violate:

- `app/` contains no business logic — pages and route handlers delegate to `actions/` or call `services/` directly for reads.
- `actions/` never queries Supabase directly — always goes through `services/` then `repositories/`.
- `repositories/` is the only layer that imports a Supabase client for data access.
- `components/` never imports a Supabase client directly — data is passed as props or fetched via hooks calling actions/services.
- All server-side writes use `lib/supabase/server.ts` (`createClient()`), never the browser client.
- `lib/supabase/admin.ts` (service-role) is used **only** in `app/api/webhooks/*` and `supabase/functions/*` — never in user-facing Server Actions or components.
- `proxy.ts` performs no Supabase DB queries — session presence check only. Role-based authorization happens in `(admin)`/`(dashboard)` layouts.
- Every order-affecting operation (create order, decrement stock, verify payment) runs inside a Supabase RPC transaction — never as separate sequential queries.
- `order_items` always stores `product_snapshot`, `variant_snapshot`, and `sku_snapshot` at creation time — never re-derived from current product/variant state.
- Stock is never decremented outside the atomic RPC. `reserved_stock` is incremented on manual-payment order creation and released on cancellation/rejection/expiry.
- SSLCommerz IPN webhook always performs server-to-server validation before trusting payload data, and always checks `gateway_ref`/`txn_id` for idempotency before creating records.
- Every admin/manager mutation on products, categories, brands, orders, payments, coupons, shipping zones, or user roles writes an `audit_logs` entry via `audit.service.ts`.
- No hardcoded hex values or raw Tailwind color classes in components — use CSS variables from `ui-tokens.md`.
- All RLS policies scope customer-facing tables (`carts`, `cart_items`, `wishlists`, `reviews`, `orders`) to `auth.uid() = user_id` — never query these tables without relying on RLS or an explicit `user_id` filter.
- `orders.status` transitions only follow the defined state machine (Pending → Paid → Processing → Shipped → Delivered, or Pending → Cancelled) — enforced in `order.service.ts`, never set arbitrarily from `actions/`.
- Guest cart (localStorage via `store/cart.store.ts`) is never written to Supabase directly — only merged via `/api/cart/merge`.

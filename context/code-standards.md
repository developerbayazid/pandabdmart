# Code Standards

Implementation rules and conventions for the entire project. The AI agent must follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

The AI agent on this project operates as a senior engineer. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against architecture.md and project-overview.md
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Failures are expected** — wrap payment, webhook, and stock operations in try/catch, log failures, never let one failure crash an order

---

## TypeScript

- Strict mode enabled in tsconfig.json — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- All async functions must have proper error handling — never let promises float unhandled
- Use `const` by default — only use `let` when reassignment is necessary

---

## Next.js 16 Conventions

- App Router only — no Pages Router
- React 19 — use React 19 APIs throughout
- All components are Server Components by default
- Only add `"use client"` when the component requires:
    - useState or useReducer
    - useEffect
    - Browser APIs (localStorage for guest cart, etc.)
    - Event listeners
    - Realtime subscriptions (Supabase Realtime channels)
    - Zustand store access (cart.store.ts, auth.store.ts, ui.store.ts)
- Never add `"use client"` to layout files unless absolutely required
- Data fetching happens in Server Components — never fetch in Client Components directly
- Route handlers live in `app/api/` — never put business logic directly in route handlers; delegate to `services/`
- Server Actions live in `actions/` — never define Server Actions inline in components
- Caching is uncached by default — all dynamic code runs at request time, except category/product pages which use explicit `revalidate` per build-plan.md (SEO & Performance phase)
- The middleware file convention is deprecated in Next.js 16 — use `proxy.ts` at project root, exporting a function named `proxy`, never `middleware`
- Always read Next.js documentation before implementing any Next.js specific feature — APIs may differ from training data

---

## File and Folder Naming

- Folders: kebab-case — `order-items`, `payment-verification`
- Component files: PascalCase — `ProductCard.tsx`, `OrderTimeline.tsx`
- Service/repository/action files: kebab-case with suffix — `order.service.ts`, `order.repository.ts`, `order.actions.ts`
- Utility files: camelCase — `formatCurrency.ts`, `slugify.ts`
- Type files: camelCase — `index.ts`
- API route files: always `route.ts`
- One component per file — never export multiple components from one file
- Index files only in `components/ui/` — never barrel export from other folders

---

## Component Structure

Every component follows this exact order:

```typescript
'use client'; // only if needed

// 1. External imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Internal imports
import { ProductCard } from '@/components/product/ProductCard';

// 3. Type definitions
type Props = {
    productId: string;
    variantId: string;
};

// 4. Component
export function ComponentName({ productId, variantId }: Props) {
    // state
    // derived values
    // handlers
    // return JSX
}
```

- Never use default exports for components — always named exports
- Props type defined directly above the component — not in a separate types file unless shared
- No inline styles — all styling via Tailwind classes using CSS variables from ui-tokens.md

---

## API Route Handlers

```typescript
// app/api/cart/merge/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { mergeCart } from '@/services/cart.service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        // validate body
        const result = await mergeCart(body);
        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('[api/cart/merge]', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 },
        );
    }
}
```

- Every route handler has a try/catch
- Every route handler validates the request body before processing
- Errors are logged with the route path as prefix: `[api/cart/merge]`
- Always return `{ success: boolean, data?: T, error?: string }`
- Never return raw data without the success wrapper
- Route handlers contain no business logic — they call `services/`, which call `repositories/`

**Exception — webhooks:** `app/api/webhooks/sslcommerz/route.ts` must always return `200 OK` to the payment gateway even on internal errors after validation succeeds (to prevent retry storms), but logs the failure and writes to `audit_logs`. Internal error responses (4xx/5xx) are only used for validation/signature failures before any processing begins.

---

## Server Actions

```typescript
// actions/cart.actions.ts

'use server';

import { revalidatePath } from 'next/cache';
import { addToCart } from '@/services/cart.service';

export async function addItemToCart(variantId: string, quantity: number) {
    try {
        // validate
        await addToCart(variantId, quantity);
        revalidatePath('/cart');
        return { success: true };
    } catch (error) {
        console.error('[actions/cart]', error);
        return { success: false, error: 'Failed to add item to cart' };
    }
}
```

- Every Server Action has a try/catch
- Every Server Action returns `{ success: boolean, error?: string }`
- Always call `revalidatePath` after mutations that affect page data
- Never throw from Server Actions — always return the error
- Server Actions call `services/`, never `repositories/` directly

---

## Services

```typescript
// services/checkout.service.ts

import { createOrderWithStockDecrement } from '@/repositories/order.repository';

export async function placeOrder(
    input: PlaceOrderInput,
): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
        // business validation (stock check, coupon validation, etc.)
        const order = await createOrderWithStockDecrement(input);
        return { success: true, orderId: order.id };
    } catch (error) {
        console.error('[services/checkout]', error);
        return { success: false, error: 'Failed to place order' };
    }
}
```

- Every service function returns `{ success: boolean, error?: string, ... }` for operations that can fail
- Services contain all business logic and validation — repositories contain only queries
- Services never import from `components/` or `actions/`
- Services never use React hooks or browser APIs
- Multi-step database operations (order creation, payment verification) call a single Supabase RPC via the repository — never multiple sequential repository calls for operations that must be atomic

---

## Repositories

```typescript
// repositories/order.repository.ts

import { createClient } from '@/lib/supabase/server';

export async function createOrderWithStockDecrement(
    input: PlaceOrderInput,
): Promise<Order> {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
        'create_order_with_stock_decrement',
        {
            p_input: input,
        },
    );
    if (error) throw error;
    return data;
}
```

- Repositories contain only Supabase queries — no business logic, no validation beyond what RLS/DB constraints enforce
- Repositories always use `lib/supabase/server.ts` in server context — never the browser client
- Repositories throw on error — services catch and translate to `{ success: false, error }`
- Every query that should be scoped to the current user relies on RLS (do not add redundant `.eq('user_id', ...)` filters that could mask RLS misconfiguration — but DO add them for service-role/admin queries where RLS is bypassed)

---

## Supabase Client Usage

```typescript
// Browser context — Client Components only (cart store sync, realtime subscriptions)
import { createClient } from '@/lib/supabase/client';

// Server context — Server Components, Route Handlers, Server Actions, Services/Repositories
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Service-role context — webhooks and Edge Functions ONLY
import { createAdminClient } from '@/lib/supabase/admin';
```

- Never use the browser client in server context
- Never use the server client in browser context
- Always await `createClient()` from `lib/supabase/server.ts` — it reads cookies asynchronously
- `createAdminClient()` is restricted to `app/api/webhooks/*` and `supabase/functions/*` per architecture.md invariants — never imported elsewhere

---

## Error Handling

- Never use empty catch blocks — always log or handle
- Console errors always include context prefix: `[layer/function-name]` (e.g. `[services/checkout]`, `[api/webhooks/sslcommerz]`)
- User-facing errors must be human readable — never expose raw error messages or Supabase error codes to the UI
- Payment/order errors are logged to `audit_logs` where they represent a state change attempt — never surfaced raw to the customer
- API route errors return `status: 500` with generic message — never expose internals

---

## Order Status & State Machine

`orders.status` must only transition along these paths, enforced in `order.service.ts`:

```
pending → paid → processing → shipped → delivered
pending → payment_pending → paid (manual MFS path)
pending → cancelled
payment_pending → cancelled (MFS rejected or stock hold expired)
paid/processing/shipped/delivered → refunded (admin only, audit logged)
```

Never set `orders.status` directly from `actions/` or components — always through `order.service.ts`, which validates the transition.

---

## Stock & Inventory Rules

- `product_variants.stock` is only decremented inside the atomic order-creation/payment-verification RPC — never via a standalone `UPDATE`
- `product_variants.reserved_stock` is incremented when a manual MFS order is created (`payment_pending`), and decremented when: the order is approved (converted to a real stock decrement), rejected, cancelled, or the reservation expires (handled by `supabase/functions/release-stock-holds`)
- Available stock shown to customers = `stock - reserved_stock`, never raw `stock`
- The stock reservation hold duration (15-30 min) is defined once as a constant — never hardcoded inline

```typescript
// lib/constants/inventory.ts
export const STOCK_RESERVATION_MINUTES = 20;
```

---

## Audit Logging

Every mutation in this list must call `audit.service.ts` to write an `audit_logs` row with `actor_id`, `action`, `entity_type`, `entity_id`, and a `meta` JSONB payload describing the change:

| Action                               | entity_type   | When                                     |
| ------------------------------------ | ------------- | ---------------------------------------- |
| `product.create`                     | product       | New product created                      |
| `product.update`                     | product       | Any field changed, including price/stock |
| `product.delete`                     | product       | Soft delete                              |
| `category.create/update/delete`      | category      | Category tree changes                    |
| `brand.create/update/delete`         | brand         | Brand changes                            |
| `order.status_update`                | order         | Admin changes order status               |
| `payment.approve`                    | payment       | MFS payment approved                     |
| `payment.reject`                     | payment       | MFS payment rejected                     |
| `payment.refund`                     | payment       | Refund issued                            |
| `coupon.create/update/delete`        | coupon        | Coupon changes                           |
| `shipping_zone.create/update/delete` | shipping_zone | Shipping zone changes                    |
| `user.role_update`                   | user          | Role changed (Admin only)                |
| `user.deactivate`                    | user          | Account deactivated (Admin only)         |

Do not add new audited actions without updating this table first. Never log customer-side actions (cart, wishlist, reviews) to `audit_logs` — that table is for admin/manager accountability only.

---

## Realtime Subscriptions

| Table              | Subscribed From                                                            | Filter                                                      |
| ------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `orders`           | `/track/[orderId]`, `/account/orders`, `/admin/dashboard`, `/admin/orders` | `id=eq.{orderId}` or `user_id=eq.{userId}` (none for admin) |
| `payments`         | `/admin/payments`                                                          | none (admin/manager role)                                   |
| `product_variants` | `/products/[slug]`                                                         | `product_id=eq.{productId}`                                 |

- Every Realtime subscription is created inside a Client Component
- Every subscription is cleaned up with `supabase.removeChannel(channel)` in a `useEffect` cleanup function — never left open
- Never subscribe to a table without a filter on customer-facing pages — admin pages may subscribe unfiltered since RLS still applies to what data is returned

---

## Environment Variables

All environment variables defined in `.env.local` for development. Never hardcode any key, URL, or secret anywhere in the codebase.

| Variable                        | Used In                                   |
| ------------------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | lib/supabase/client.ts, server.ts         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | lib/supabase/client.ts, server.ts         |
| `SUPABASE_SERVICE_ROLE_KEY`     | lib/supabase/admin.ts (server-only)       |
| `SSLCOMMERZ_STORE_ID`           | lib/payments/sslcommerz.ts                |
| `SSLCOMMERZ_STORE_PASSWORD`     | lib/payments/sslcommerz.ts                |
| `SSLCOMMERZ_BASE_URL`           | lib/payments/sslcommerz.ts                |
| `BKASH_MERCHANT_NUMBER`         | lib/payments/bkash.ts (display only)      |
| `NAGAD_MERCHANT_NUMBER`         | lib/payments/nagad.ts (display only)      |
| `RESEND_API_KEY`                | lib/email/                                |
| `RESEND_FROM_EMAIL`             | lib/email/                                |
| `NEXT_PUBLIC_SITE_URL`          | Used for SSLCommerz callback URLs, emails |

`NEXT_PUBLIC_` prefix means the variable is exposed to the browser. Never add `NEXT_PUBLIC_` to secret keys — `SUPABASE_SERVICE_ROLE_KEY`, `SSLCOMMERZ_STORE_PASSWORD` must never have this prefix.

---

## Shared Constants

Values used in more than one place are defined once in `lib/constants/` and imported everywhere. Never hardcode these values inline.

```typescript
// lib/constants/inventory.ts
export const STOCK_RESERVATION_MINUTES = 20;
export const LOW_STOCK_THRESHOLD = 5;

// lib/constants/pagination.ts
export const PRODUCTS_PER_PAGE = 20;
export const ORDERS_PER_PAGE = 20;

// lib/constants/order.ts
export const ORDER_STATUSES = [
    'pending',
    'payment_pending',
    'paid',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
] as const;

// lib/constants/roles.ts
export const ROLES = ['admin', 'shop_manager', 'customer'] as const;
```

---

## Import Aliases

Always use the `@/` alias — never use relative imports that go up more than one level.

```typescript
// Correct
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { STOCK_RESERVATION_MINUTES } from '@/lib/constants/inventory';

// Never
import { Button } from '../../../components/ui/button';
```

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for why — explaining a non-obvious decision (e.g. why a webhook always returns 200, why a query bypasses RLS)
- Never leave TODO comments in committed code

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does shadcn/ui already have this component?
2. Does Next.js already provide this functionality?
3. Is there a simpler native solution?

Approved dependencies for this project:

- `@supabase/ssr` — Supabase client (browser + server)
- `@supabase/supabase-js` — Supabase service-role client
- `resend` — Email delivery
- `@react-pdf/renderer` — Invoice PDF generation
- `zustand` — Guest cart, auth state, UI state
- `zod` — Schema validation
- `lucide-react` — Icons
- `recharts` — Admin dashboard charts
- `tailwindcss` — Styling
- `shadcn/ui` components — UI primitives

Do not install any other packages without updating this list first.

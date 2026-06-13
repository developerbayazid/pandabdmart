# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to ShopName.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated. This applies especially to Supabase (`@supabase/ssr` patterns change between versions) and Next.js 16 (proxy.ts is a recent change).

---

## Supabase

**Check first:** Check AGENTS.md for an installed Supabase skill. If a Supabase MCP server is configured — use it. The skill/MCP will have the latest API patterns, especially for `@supabase/ssr`.

### Client, Server, Admin — Three Instances

Never mix them. See architecture.md for full setup code.

```typescript
// lib/supabase/client.ts — browser context only
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
    createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
```

```typescript
// lib/supabase/server.ts — server context only
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
```

```typescript
// lib/supabase/admin.ts — service-role, server-only
// Restricted to app/api/webhooks/* and supabase/functions/* — see code-standards.md
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const createAdminClient = () =>
    createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
    );
```

**Rules:**

- Browser client — Client Components, realtime subscriptions, cart store sync
- Server client — Server Components, Route Handlers, Server Actions, repositories
- Admin client — webhooks and Edge Functions only, bypasses RLS, never exposed to browser
- Always `await createClient()` from `lib/supabase/server.ts` — cookies are read asynchronously

---

### Auth

```typescript
// Get current user in server context
const supabase = await createClient();
const {
    data: { user },
    error,
} = await supabase.auth.getUser();
if (!user) redirect('/auth/login');

// Get role from users table (not auth.users)
const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
```

```typescript
// OAuth sign-in (client component)
const supabase = createClient();
await supabase.auth.signInWithOAuth({
    provider: 'google', // or "github"
    options: { redirectTo: `${origin}/api/auth/callback` },
});
```

```typescript
// Magic link
await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/api/auth/callback` },
});
```

**Rules:**

- `auth.getUser()` always called server-side for protected pages — never trust `getSession()` alone for authorization decisions (it doesn't revalidate the JWT against the server)
- Role checks always query the `users` table (`role` column) — never infer role from auth metadata
- OAuth callback handler at `app/api/auth/callback/route.ts` exchanges the code for a session via `supabase.auth.exchangeCodeForSession()`

---

### DB Queries

```typescript
// Read — RLS enforces user scoping automatically
const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), payments(*), shipping_addresses(*)')
    .eq('id', orderId)
    .single();

// Insert
const { data, error } = await supabase
    .from('reviews')
    .insert({ user_id: user.id, product_id, rating, comment })
    .select()
    .single();

// Update — scoped by RLS, but explicit filter still recommended for clarity
const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId);
```

**Rules:**

- Always handle the `error` return — never assume success
- Use `.single()` when expecting exactly one row, `.maybeSingle()` when the row may not exist
- Joins via nested select (`order_items(*)`) — avoid N+1 queries from separate calls
- RLS policies are the source of truth for access control — repositories should not duplicate authorization logic, only call the query

---

### RPC (Atomic Transactions)

All order-affecting operations call a Postgres function via `rpc()` — never multiple sequential queries.

```typescript
// repositories/order.repository.ts
const { data, error } = await supabase.rpc(
    'create_order_with_stock_decrement',
    {
        p_user_id: userId,
        p_cart_items: cartItems,
        p_shipping_address: shippingAddress,
        p_payment_method: paymentMethod,
        p_coupon_code: couponCode,
    },
);
if (error) throw error;
```

```sql
-- supabase/migrations/.../create_order_with_stock_decrement.sql
create or replace function create_order_with_stock_decrement(
  p_user_id uuid,
  p_cart_items jsonb,
  p_shipping_address jsonb,
  p_payment_method text,
  p_coupon_code text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_item jsonb;
begin
  -- check stock for all items first, raise exception if any insufficient
  for v_item in select * from jsonb_array_elements(p_cart_items)
  loop
    if (select stock - reserved_stock from product_variants where id = (v_item->>'variant_id')::uuid)
       < (v_item->>'quantity')::int then
      raise exception 'Insufficient stock for variant %', v_item->>'variant_id';
    end if;
  end loop;

  insert into orders (user_id, status, payment_method, ...)
  values (p_user_id, 'pending', p_payment_method, ...)
  returning id into v_order_id;

  -- insert order_items with snapshots, decrement stock, etc.
  -- ...

  return jsonb_build_object('id', v_order_id);
end;
$$;
```

**Rules:**

- Functions use `security definer` so they can bypass RLS for the multi-table transaction, but must internally validate `p_user_id` matches `auth.uid()` where relevant
- Stock check happens inside the same transaction as the decrement — never check-then-decrement as two separate calls (race condition)
- RPC always returns enough data for the calling service to redirect/display (at minimum the new `order_id`)
- Every RPC function used for orders/payments is defined in its own migration file under `supabase/migrations/`

---

### Storage

```typescript
// Upload product image
const { data, error } = await supabase.storage
    .from('product-images')
    .upload(`products/${productId}/${filename}`, fileBuffer, {
        contentType: file.type,
        upsert: true,
    });

// Get public URL
const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(`products/${productId}/${filename}`);

const url = data.publicUrl;
```

**Storage paths:**

- Product/variant images: `products/{product_id}/{filename}`

**Rules:**

- `product-images` bucket — public read, authenticated write (admin/shop_manager only, enforced via storage RLS policy)
- Always save the public URL back to the relevant table (`variant_images.url`) after upload
- Never write files to disk — upload buffer directly to storage
- Use `upsert: true` only when intentionally replacing an existing file (e.g. re-uploading the same variant's primary image)

---

### Realtime

```typescript
// Client component — order tracking page
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function OrderStatusBadge({ orderId, initialStatus }: { orderId: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => setStatus(payload.new.status as string),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return <span>{status}</span>;
}
```

**Rules:**

- Realtime publication must be enabled on `orders`, `payments`, `product_variants` (done in migration 03 — see architecture.md)
- Every subscription created in a `useEffect` and cleaned up with `supabase.removeChannel(channel)` in the cleanup function
- Use the most specific `filter` possible (`id=eq.{orderId}`, `user_id=eq.{userId}`) on customer-facing pages — admin pages may subscribe unfiltered since RLS still applies
- Realtime payload (`payload.new`) is the source of update — re-fetching the full row is unnecessary for simple status changes

---

## SSLCommerz

**Check first:** Check AGENTS.md for an installed SSLCommerz skill. If none exists — use this file and the official SSLCommerz Sandbox/Live API docs. SSLCommerz has separate sandbox and live base URLs — never hardcode which one, always read from `SSLCOMMERZ_BASE_URL`.

### Session Initiation

```typescript
// lib/payments/sslcommerz.ts
export async function initiateSSLCommerzSession(
    order: Order,
): Promise<{ gatewayUrl: string }> {
    const response = await fetch(
        `${process.env.SSLCOMMERZ_BASE_URL}/gwprocess/v4/api.php`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                store_id: process.env.SSLCOMMERZ_STORE_ID!,
                store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
                total_amount: order.grand_total.toString(),
                currency: 'BDT',
                tran_id: order.id,
                success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/sslcommerz`,
                fail_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/sslcommerz`,
                cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
                ipn_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/sslcommerz`,
                cus_name: order.shipping_address.name,
                cus_phone: order.shipping_address.phone,
                cus_add1: order.shipping_address.address,
                shipping_method: 'Courier',
                product_name: 'Order ' + order.id,
                product_category: 'General',
                product_profile: 'general',
            }),
        },
    );

    if (!response.ok) {
        throw new Error(`SSLCommerz session error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== 'SUCCESS') {
        throw new Error(
            `SSLCommerz session failed: ${data.failedreason || 'unknown'}`,
        );
    }

    return { gatewayUrl: data.GatewayPageURL };
}
```

### IPN Validation (Webhook)

```typescript
// app/api/webhooks/sslcommerz/route.ts
export async function POST(req: NextRequest) {
    try {
        const body = await req.formData();
        const valId = body.get('val_id') as string;
        const tranId = body.get('tran_id') as string;

        // Step 1 — always validate server-to-server, never trust the POST body alone
        const params = new URLSearchParams({
            val_id: valId,
            store_id: process.env.SSLCOMMERZ_STORE_ID!,
            store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
            format: 'json',
        });

        const validation = await fetch(
            `${process.env.SSLCOMMERZ_BASE_URL}/validator/api/validationserverAPI.php?${params}`,
        );
        const result = await validation.json();

        if (result.status !== 'VALID' && result.status !== 'VALIDATED') {
            return NextResponse.json(
                { success: false, error: 'Invalid transaction' },
                { status: 400 },
            );
        }

        // Step 2 — idempotency check before processing
        // ... payment.service.ts checks existing payment by gateway_ref (tranId)

        // Step 3 — process via RPC (create order, decrement stock, create payment)
        // ...

        // Always 200 OK after validation succeeds, even if internal processing has issues
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[api/webhooks/sslcommerz]', error);
        // Still 200 if validation already succeeded — see code-standards.md
        return NextResponse.json({ success: false }, { status: 200 });
    }
}
```

**Rules:**

- Always validate via `validationserverAPI.php` server-to-server before trusting any IPN data — the POST body alone is not proof of payment
- `tran_id` is the order ID — set this when initiating the session, used to match the webhook back to the order
- Idempotency: check `payments.gateway_ref` (or `txn_id`) for an existing `verified` record before processing — SSLCommerz may send the IPN multiple times
- Return `200 OK` after validation succeeds even if internal processing logs an error — prevents SSLCommerz retry storms (see code-standards.md webhook exception)
- Return `400` only for signature/validation failures before any processing begins
- `SSLCOMMERZ_BASE_URL` differs between sandbox (`https://sandbox.sslcommerz.com`) and live (`https://securepay.sslcommerz.com`) — always read from env, never hardcode

---

## bKash / Nagad (Manual MFS)

**Check first:** These are manual flows — no API integration, no SDK. Check AGENTS.md only if a verification-assist skill has been added later.

### Order Creation (Manual Payment)

```typescript
// services/checkout.service.ts
export async function placeManualPaymentOrder(
    input: PlaceOrderInput,
): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
        const order = await createOrderWithReservation({
            ...input,
            status: 'payment_pending',
        });

        // payments record created with status 'pending', txn_id and payment number from customer input
        await createPaymentRecord({
            order_id: order.id,
            status: 'pending',
            amount: order.grand_total,
            currency: 'BDT',
            txn_id: input.txnId,
        });

        // stock reserved via reservation.service.ts — see lib/constants/inventory.ts
        return { success: true, orderId: order.id };
    } catch (error) {
        console.error('[services/checkout]', error);
        return { success: false, error: 'Failed to place order' };
    }
}
```

### Admin Verification

```typescript
// services/payment.service.ts
export async function approveManualPayment(paymentId: string, adminId: string) {
    // Supabase RPC: mark payment verified, atomic stock decrement, order status = paid
    const { error } = await supabase.rpc('approve_manual_payment', {
        p_payment_id: paymentId,
        p_verified_by: adminId,
    });
    if (error) throw error;

    await logAuditEvent({
        actor_id: adminId,
        action: 'payment.approve',
        entity_type: 'payment',
        entity_id: paymentId,
    });
}

export async function rejectManualPayment(paymentId: string, adminId: string) {
    const { error } = await supabase.rpc('reject_manual_payment', {
        p_payment_id: paymentId,
    });
    if (error) throw error;

    await logAuditEvent({
        actor_id: adminId,
        action: 'payment.reject',
        entity_type: 'payment',
        entity_id: paymentId,
    });
}
```

**Rules:**

- `payment_number` and `txn_id` are free-text fields submitted by the customer — never validated against a third-party API (no bKash/Nagad API integration exists)
- `BKASH_MERCHANT_NUMBER` and `NAGAD_MERCHANT_NUMBER` env vars are display-only — shown to the customer as payment instructions, never used in code logic
- Approval and rejection always go through their respective RPC functions — never a plain `UPDATE` on `orders`/`payments`/`product_variants`
- Every approve/reject writes an `audit_logs` entry via `audit.service.ts`

---

## Resend

**Check first:** Check AGENTS.md for an installed Resend skill.

### Sending Email

```typescript
// lib/email/send.ts
import { Resend } from 'resend';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendOrderConfirmationEmail(
    order: Order,
    customerEmail: string,
) {
    try {
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL!,
            to: customerEmail,
            subject: `Order Confirmation — #${order.id}`,
            react: OrderConfirmationEmail({ order }),
        });
    } catch (error) {
        console.error('[lib/email/send]', error);
        // Never block the order flow on email failure
    }
}
```

**Email templates (`emails/`):**

| Template                 | Triggered From                                            |
| ------------------------ | --------------------------------------------------------- |
| `order-confirmation.tsx` | SSLCommerz IPN success, manual MFS approval               |
| `payment-success.tsx`    | Manual MFS approval (if distinct from order confirmation) |
| `shipment-update.tsx`    | Admin updates order status to Shipped/Delivered           |

**Rules:**

- Email templates are React components in `emails/`, rendered via Resend's `react` field — never raw HTML strings
- Email send failures are logged but never throw — never block order creation, payment verification, or status updates on email delivery
- `RESEND_FROM_EMAIL` must be a verified domain in Resend — never a placeholder/unverified address in production

---

## @react-pdf/renderer

**Check first:** Check AGENTS.md for an installed react-pdf skill. PDF generation APIs can differ from general training knowledge.

### Invoice PDF Generation

```typescript
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Helvetica" },
  section: { marginBottom: 10 },
  heading: { fontSize: 14, fontWeight: "bold" },
  text: { fontSize: 10 },
  row: { flexDirection: "row", justifyContent: "space-between" },
});

const InvoicePDF = ({ order }: { order: Order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>Invoice — Order #{order.id}</Text>
        <Text style={styles.text}>{order.shipping_address.name}</Text>
      </View>
      {order.order_items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.text}>{item.product_snapshot.name}</Text>
          <Text style={styles.text}>{item.quantity} x {item.unit_price}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

// Server Action — stream to browser
const buffer = await renderToBuffer(<InvoicePDF order={order} />);
```

**Supported CSS properties:**
Only use these — others are silently ignored:
`padding, margin, fontSize, color, fontFamily, flexDirection, alignItems, justifyContent, borderRadius, width, height, fontWeight, textAlign, lineHeight`

**Rules:**

- Server-side only — never import in client components
- Always use `renderToBuffer` and stream the result as the Server Action's response — never write to disk
- Invoice data sourced from `order_items.product_snapshot` / `variant_snapshot` / `sku_snapshot` — never the live `products`/`product_variants` tables (snapshot is the source of truth for historical orders)
- Invoice generation only in the order tracking page's server action — not exposed as a public API route

---

## Zustand

**Check first:** General training knowledge is reliable for Zustand — it's a small, stable API. No skill typically needed.

### Guest Cart Store

```typescript
// store/cart.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
    variantId: string;
    quantity: number;
    priceAtTime: number;
};

type CartStore = {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    removeItem: (variantId: string) => void;
    clear: () => void;
};

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],
            addItem: (item) =>
                set((state) => {
                    const existing = state.items.find(
                        (i) => i.variantId === item.variantId,
                    );
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.variantId === item.variantId
                                    ? {
                                          ...i,
                                          quantity: i.quantity + item.quantity,
                                      }
                                    : i,
                            ),
                        };
                    }
                    return { items: [...state.items, item] };
                }),
            updateQuantity: (variantId, quantity) =>
                set((state) => ({
                    items: state.items.map((i) =>
                        i.variantId === variantId ? { ...i, quantity } : i,
                    ),
                })),
            removeItem: (variantId) =>
                set((state) => ({
                    items: state.items.filter((i) => i.variantId !== variantId),
                })),
            clear: () => set({ items: [] }),
        }),
        { name: 'guest-cart' }, // localStorage key
    ),
);
```

**Rules:**

- `persist` middleware with `name: "guest-cart"` is the only sanctioned use of localStorage for cart data
- Guest cart store is cleared (`clear()`) only after a successful merge via `/api/cart/merge`
- Zustand stores never call Supabase directly — components read from the store and call `actions/` for server sync
- `auth.store.ts` and `ui.store.ts` follow the same pattern — no `persist` middleware unless explicitly needed (auth state should come from Supabase session, not localStorage)

---

## Tailwind CSS + shadcn/ui

**Check first:** Check AGENTS.md for an installed Tailwind/shadcn skill if the Tailwind version differs from training data (Tailwind v4 changed configuration significantly from v3).

**Rules:**

- All colors via CSS variables defined in `ui-tokens.md` / `globals.css` `@theme` block — never raw Tailwind color classes (`bg-blue-500`) or hardcoded hex values
- shadcn/ui components installed individually via CLI as needed — never bulk-installed
- Component variants (button styles, badge colors for order status, match score colors) defined once in `ui-tokens.md` — referenced consistently across storefront and admin

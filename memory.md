# Memory — Add to Cart Buttons + Dynamic Navbar Cart Count

Last updated: 2026-06-15 08:01

## What was built

**Add to Cart button functionality across all product cards:**
- Created `hooks/useAddToCart.ts` — dual guest/auth hook. Guest → zustand store; Auth → `addItemAction` server action. Toast on success/error.
- Updated `types/shop.ts` — added `type: 'simple' | 'variable'` and `variantId: string | null` to `ShopProduct`
- Updated `types/product.ts` — added `type` and `variantId` to `RelatedProduct`
- Updated `repositories/product.repository.ts` — `getShopProducts`, `getHomepageProducts`, `getRelatedProducts` fetch `type` and map `variantId`
- Updated `repositories/category.repository.ts` — `getCategoryProducts` fetches `type` and maps `variantId`
- Updated `components/product/ProductCard.tsx` — simple products: add to cart; variable: shows "Select Options", navigates to detail
- Updated `components/product/ProductDetailPage.tsx` — three button states: Out of Stock / Select Options / Add To Cart. Uses selectedVariant + quantity
- Updated `components/product/RelatedProducts.tsx` — same simple/variable pattern
- Updated `components/home/FeaturedProduct.tsx` — converted to client, same simple/variable pattern

**Dynamic navbar cart count:**
- Created `components/cart/CartNavLink.tsx` — client component. Guest: zustand subscription (instant). Auth: server-provided count. Badge always visible (including 0). Caps at "99+".
- Updated `components/layout/Navbar.tsx` — fetches `getCartCount(userId)` server-side for auth users, passes `initialCount` to CartNavLink
- Added `getCartCount(userId)` to `repositories/cart.repository.ts` — sums all `cart_items.quantity` for the user's cart

## Decisions made

- Cart count for guests: zustand store subscription — updates instantly when items change
- Cart count for auth users: server-side fetch on each page load — updates on navigation
- Badge always visible (including 0) — user requested this explicitly
- Simple/variable product distinction: variantId is set only when variants.length === 1 + product.type === 'simple'
- Variable product card buttons: "Select Options" text, navigates to product detail instead of adding to cart

## Current state

- Phase 1: 01–04 ✓
- Phase 2: 05–09 ✓ (complete)
- Phase 3: 10 ✓, 11 ✓, Add to Cart wired ✓, Navbar cart count ✓
- All Add to Cart buttons functional across ProductCard, RelatedProducts, FeaturedProduct, ProductDetailPage
- Cart count badge dynamic in navbar (guest=zustand, auth=server-side)
- TypeScript + next build clean, lint: 0 new errors
- All styling uses CSS variables from ui-tokens.md

## Next session starts with

Phase 3 — Feature 12: Checkout Page — Full UI:
- `app/(storefront)/checkout/page.tsx` — checkout route (auth-gated)
- Shipping information form (name, phone, address, city, district, postal code)
- Shipping zone selection (Inside Dhaka / Outside Dhaka radio)
- Order summary sidebar (line items from cart, subtotal, coupon discount, shipping cost, grand total)
- Payment method selection (SSLCommerz / bKash / Nagad radio cards)
- bKash/Nagad payment instructions + TxnID + payment number fields
- Place Order button
- Design reference: `context/designs/Billing.png`

## Open questions

- None

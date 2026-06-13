# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

Document format for each component:

```
#### ComponentName
- **File:** `components/.../ComponentName.tsx`
- **Classes:**
  - Element: `tailwind classes using CSS variables from ui-tokens.md`
- **Props:** `propName: type`
- **Behavior:** notes on states, interactions, conditional rendering
```

After 3-5 components in the same area (e.g. all storefront cards, all admin tables) share identical classes for the same element type, extract a **Patterns** section (see template below) so future components reference the pattern instead of repeating it.

---

## Components

_No components built yet. Add entries here as Phase 1 features are implemented._

### Layout

#### Navbar
- **File:** `components/layout/Navbar.tsx`
- **Classes:**
  - Announcement bar: `bg-background border-b border-border py-2`
  - Nav: `bg-surface border-b border-border h-16`
  - Logo: `h-7 w-auto`
  - Nav links: `text-[13px] font-medium text-text-secondary hover:text-text-primary tracking-wide`
  - Cart badge: `bg-text-primary text-white text-[10px] font-medium rounded-full h-4 min-w-4 px-1`
- **Props:** none
- **Behavior:** Responsive, fixed announcement bar + main nav

#### Footer
- **File:** `components/layout/Footer.tsx`
- **Classes:**
  - Container: `bg-text-primary text-white`
  - Links: `text-[13px] text-white/70 hover:text-white`
  - Copyright: `text-[11px] text-white/50 text-center border-t border-white/10`
- **Props:** none
- **Behavior:** 4-column grid on desktop, stacked on mobile

### Storefront — Homepage

#### HeroSection
- **File:** `components/home/HeroSection.tsx`
- **Classes:**
  - Section: `bg-background overflow-hidden`
  - Title: `font-[family-name:var(--font-serif)] text-[40px] lg:text-[52px] font-normal leading-[1.2] text-text-primary`
  - Subtitle: `text-text-secondary text-sm`
  - CTA: `border border-text-primary text-text-primary px-6 py-3 text-sm font-medium hover:bg-surface-inverse hover:text-text-inverse rounded-md`
  - Price tag: `bg-surface border border-border px-3 py-1.5 text-sm font-medium text-text-primary`
  - Dots: `w-2 h-2 rounded-full bg-text-primary | bg-border-strong`
- **Props:** none (internal state for carousel)
- **Behavior:** 3-slide carousel with prev/next arrows and dot navigation

#### FeaturedProduct
- **File:** `components/home/FeaturedProduct.tsx`
- **Classes:**
  - Category label: `text-text-secondary text-sm font-medium` with `w-8 h-px bg-text-secondary`
  - Title: `font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal leading-[1.3] text-text-primary`
  - Price: `text-[24px] font-semibold text-text-primary`
  - Thumbnails: `w-16 h-16 border border-border rounded-md overflow-hidden bg-surface-secondary`
  - CTA: `border border-text-primary text-text-primary px-6 py-2.5 text-sm font-medium hover:bg-surface-inverse hover:text-text-inverse rounded-md`
- **Props:** none (internal mock data)
- **Behavior:** Static featured product display with thumbnails

#### ProductCards
- **File:** `components/home/ProductCards.tsx`
- **Classes:**
  - Card image: `w-full h-[280px] lg:h-[320px] bg-surface-secondary rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300`
  - Category: `text-[11px] text-text-muted uppercase tracking-wider`
  - Name: `text-[13px] font-medium text-text-primary leading-snug line-clamp-2`
  - Price: `text-[13px] font-semibold text-text-primary`
- **Props:** none (internal mock data)
- **Behavior:** 3-column grid of product cards with hover zoom

#### TrendingProducts
- **File:** `components/home/TrendingProducts.tsx`
- **Classes:**
  - Title: `font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary`
  - Tabs: `text-[13px] font-medium pb-1 border-b-2` with active `text-text-primary border-text-primary` and inactive `text-text-secondary border-transparent`
  - Card image: `w-full h-[220px] lg:h-[280px] bg-surface-secondary rounded-lg overflow-hidden`
  - Grid transition: `transition-all duration-700 ease-in-out animate-in fade-in slide-in-from-bottom-6`
- **Props:** none (internal state for tabs)
- **Behavior:** Filterable 4-column grid with category tabs. Smooth fade+slide animation when tab changes via `animationKey` state.

#### CollectionGrid
- **File:** `components/home/CollectionGrid.tsx`
- **Classes:**
  - Grid: `grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6`
  - Left tall: `row-span-2 relative h-[400px] lg:h-[600px] rounded-lg overflow-hidden`
  - Right items: `relative h-[190px] lg:h-[290px] rounded-lg overflow-hidden`
- **Props:** none (internal mock data)
- **Behavior:** 5-image masonry-style grid (1 tall left, 2x2 right)

#### FestiveBanner
- **File:** `components/home/FestiveBanner.tsx`
- **Classes:**
  - Container: `bg-surface-secondary rounded-2xl overflow-hidden`
  - Label: `text-[12px] text-text-secondary uppercase tracking-wider font-medium`
  - Title: `font-[family-name:var(--font-serif)] text-[28px] lg:text-[36px] font-normal leading-[1.3] text-text-primary`
  - Link: `text-[13px] text-text-primary underline underline-offset-4 font-medium hover:text-text-secondary`
- **Props:** none (internal mock data)
- **Behavior:** Promotional banner with text left, image right

#### RecentProducts
- **File:** `components/home/RecentProducts.tsx`
- **Classes:**
  - Title: `font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary`
  - Card image: `w-full h-[220px] lg:h-[280px] bg-surface-secondary rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300`
  - Category: `text-[11px] text-text-muted uppercase tracking-wider`
  - Name: `text-[13px] font-medium text-text-primary leading-snug line-clamp-2`
  - Price: `text-[13px] font-semibold text-text-primary`
  - Add To Cart: `border border-text-primary text-text-primary px-5 py-2 text-[12px] font-medium hover:bg-surface-inverse hover:text-text-inverse rounded-md`
  - Pagination button: `w-8 h-8 text-[13px] font-medium rounded-md` active `bg-surface-inverse text-text-inverse`, inactive `border border-border text-text-secondary hover:bg-surface-secondary`
  - Prev/Next: `px-3 py-1.5 text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary`
- **Props:** none (internal mock data)
- **Behavior:** 12 products, 8 per page, 4-column grid with numbered pagination (Previous/Next + page numbers)

#### LatestNews
- **File:** `components/home/LatestNews.tsx`
- **Classes:**
  - Title: `font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary`
  - Card image: `w-full h-[220px] lg:h-[260px] rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300`
  - Card title: `text-[14px] font-medium text-text-primary leading-snug line-clamp-2`
  - Link: `text-[12px] text-text-secondary underline underline-offset-2 hover:text-text-primary`
- **Props:** none (internal mock data)
- **Behavior:** 3-column blog card grid with hover zoom

### Storefront — Shop & Category

<!-- ProductCard, FilterSidebar, SortDropdown, ProductGrid, Pagination, CategoryBanner, Breadcrumb -->

### Storefront — Auth

#### SignInPage
- **File:** `app/(storefront)/signin/page.tsx`
- **Classes:**
  - Container: `min-h-screen flex items-center justify-center bg-background px-4`
  - Card: `w-full max-w-md bg-surface border border-border rounded-2xl p-8`
  - Title: `font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary text-center`
  - Subtitle: `text-sm text-text-secondary text-center mb-8`
  - Error: `bg-error-light text-error-foreground text-sm p-3 rounded-md`
  - Success message: `bg-success-light text-success-foreground text-sm p-3 rounded-md`
  - Input: `w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary`
  - Label: `block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5`
  - Primary button: `w-full bg-surface-inverse text-text-inverse rounded-md px-4 py-2 text-sm font-medium hover:bg-surface-inverse-hover disabled:opacity-50 transition-colors`
  - OAuth button: `w-full bg-surface border border-border rounded-md px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:opacity-50 transition-colors flex items-center justify-center gap-2`
  - Divider: `flex-1 h-px bg-border` with `text-xs text-text-muted`
  - Footer link: `text-sm text-text-secondary` with `text-text-primary underline underline-offset-2 font-medium hover:text-text-secondary`
- **Props:** none (internal state: mode, email, password, error, loading)
- **Behavior:** Two modes — password sign-in (email + password + OAuth buttons) and magic link (email only + send button). Toggle via inline links. Google OAuth, GitHub OAuth, magic link to `/auth/callback`.

#### RegisterPage
- **File:** `app/(storefront)/register/page.tsx`
- **Classes:** Same card, input, button, and error patterns as SignInPage
- **Props:** none
- **Behavior:** Name + email + password + confirm password form. Validates password length (min 6) and match.

#### ForgotPasswordPage
- **File:** `app/(storefront)/forgot-password/page.tsx`
- **Classes:** Same card, input, button, and message patterns as SignInPage
- **Props:** none
- **Behavior:** Email form to send password reset link. Shows success message on send.

#### AuthCallbackPage
- **File:** `app/(storefront)/auth/callback/page.tsx`
- **Classes:** `min-h-screen flex items-center justify-center bg-background` with `text-sm text-text-secondary`
- **Props:** none
- **Behavior:** Client component listening for `onAuthStateChange` from Supabase. Reads `redirect` query param. Landing page for magic link emails.

### Storefront — Product Detail

<!-- ImageGallery, VariantSelector, StockBadge, ReviewsList, ReviewForm, RelatedProducts -->

### Cart & Checkout

<!-- CartItemRow, OrderSummary, CouponInput, ShippingForm, ShippingZoneSelector, PaymentMethodSelector, MFSInstructions -->

### Order Tracking

<!-- OrderStatusBadge, OrderTimeline, InvoiceDownloadButton -->

### Customer Dashboard

<!-- ProfileForm, AddressBook, OrderHistoryTable, WishlistGrid, ReviewsList -->

#### DashboardLayout
- **File:** `app/(dashboard)/layout.tsx`
- **Classes:**
  - Page: `min-h-screen bg-background`
  - Header: `bg-surface border-b border-border h-16 flex items-center justify-between px-6`
  - Sidebar: `w-60 min-h-[calc(100vh-64px)] bg-surface border-r border-border p-6`
  - Sidebar link: `block px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-md transition-colors`
  - Main content: `flex-1 p-8`
- **Props:** `children: React.ReactNode`
- **Behavior:** Server Component with `getUser()` auth check. Sidebar with Account, Orders, Wishlist, Reviews links.

### Admin — Layout

#### AdminLayout
- **File:** `app/admin/layout.tsx`
- **Classes:** Same header/sidebar/layout pattern as DashboardLayout
- **Additional:** Role badge `bg-surface-secondary text-text-secondary text-xs font-medium px-2 py-1 rounded-full capitalize`
- **Props:** `children: React.ReactNode`
- **Behavior:** Server Component with `getUser()` role check (admin/shop_manager). Sidebar adapts: Admin sees full nav (Dashboard, Products, Categories, Brands, Orders, Payments, Customers, Coupons, Shipping, Settings, Audit Logs); Shop Manager sees restricted nav (no Customers, Coupons, Shipping, Settings, Audit Logs).

### Admin — Dashboard

<!-- StatCard, RecentOrdersTable, SalesChart, LowStockAlert -->

### Admin — Catalog Management

<!-- ProductsTable, ProductForm, VariantEditor, CategoryTree, BrandList -->

### Admin — Order & Payment Management

<!-- OrdersTable, OrderDetailView, StatusUpdateDropdown, PendingPaymentsQueue, ApproveRejectButtons -->

### Admin — Coupons, Shipping, Customers, Audit

<!-- CouponsTable, ShippingZonesTable, UsersTable, AuditLogTable -->

---

## Patterns

## Patterns — Homepage Components (Imprinted 2026-06-13)

| Property | Class | Used By |
|----------|-------|---------|
| Section heading (serif) | `font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary` | FeaturedProduct, TrendingProducts, LatestNews |
| Product card image | `w-full h-[220px-320px] bg-surface-secondary rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300` | ProductCards, TrendingProducts |
| Product category label | `text-[11px] text-text-muted uppercase tracking-wider` | ProductCards, TrendingProducts |
| Product name | `text-[13px] font-medium text-text-primary leading-snug line-clamp-2` | ProductCards, TrendingProducts |
| Product price | `text-[13px] font-semibold text-text-primary` | ProductCards, TrendingProducts |
| Outline CTA button | `border border-text-primary text-text-primary px-6 py-2.5 text-sm font-medium hover:bg-surface-inverse hover:text-text-inverse rounded-md` | HeroSection, FeaturedProduct |
| Section container | `max-w-[1440px] mx-auto px-8 lg:px-16` | All homepage sections |

**Pattern notes:**
- All homepage sections use `bg-background` except FestiveBanner which uses `bg-surface-secondary`
- Serif font (Playfair Display) used for all section headings and the hero title to match the design aesthetic
- Product cards share identical markup across ProductCards and TrendingProducts — extract into a ProductCard component if reused again
- Images use `object-cover` for cards and `object-contain` for hero/featured/festive sections

## Patterns — Auth Forms (Imprinted 2026-06-13)

| Property | Class | Used By |
|----------|-------|---------|
| Auth card | `w-full max-w-md bg-surface border border-border rounded-2xl p-8` | SignIn, Register, ForgotPassword |
| Auth title (serif) | `font-[family-name:var(--font-serif)] text-[28px] font-normal text-text-primary text-center` | SignIn, Register, ForgotPassword |
| Auth subtitle | `text-sm text-text-secondary text-center mb-8` | SignIn, Register, ForgotPassword |
| Form input | `w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary` | SignIn, Register, ForgotPassword |
| Form label | `block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5` | SignIn, Register, ForgotPassword |
| Auth primary button | `w-full bg-surface-inverse text-text-inverse rounded-md px-4 py-2 text-sm font-medium hover:bg-surface-inverse-hover disabled:opacity-50 transition-colors` | SignIn, Register, ForgotPassword |
| OAuth/secondary button | `w-full bg-surface border border-border rounded-md px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary disabled:opacity-50 transition-colors flex items-center justify-center gap-2` | SignIn (Google, GitHub, magic link) |
| Auth error box | `bg-error-light text-error-foreground text-sm p-3 rounded-md` | SignIn, Register, ForgotPassword |
| Auth success message | `bg-success-light text-success-foreground text-sm p-3 rounded-md` | SignIn, ForgotPassword |
| Auth footer link | `text-sm text-text-secondary` with inner link `text-text-primary underline underline-offset-2 font-medium hover:text-text-secondary` | SignIn, Register, ForgotPassword |

## Patterns — Dashboard/Admin Layout (Imprinted 2026-06-13)

| Property | Class | Used By |
|----------|-------|---------|
| Layout container | `min-h-screen bg-background` | DashboardLayout, AdminLayout |
| Top header | `bg-surface border-b border-border h-16 flex items-center justify-between px-6` | DashboardLayout, AdminLayout |
| Sidebar | `w-60 min-h-[calc(100vh-64px)] bg-surface border-r border-border p-6` | DashboardLayout, AdminLayout |
| Sidebar link | `block px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-md transition-colors` | DashboardLayout, AdminLayout |
| Main content | `flex-1 p-8` | DashboardLayout, AdminLayout |
| Role badge | `bg-surface-secondary text-text-secondary text-xs font-medium px-2 py-1 rounded-full capitalize` | AdminLayout (admin role badge) |

## Patterns — Footer (Imprinted 2026-06-13)

| Property | Class | Used By |
|----------|-------|---------|
| Footer container | `bg-text-primary text-white` | Footer |
| Footer link | `text-[13px] text-white/70 hover:text-white transition-colors` | Footer |
| Footer heading | `text-[14px] font-semibold text-white mb-4` | Footer |

Likely early candidates for shared patterns in this project:

- Card shell (used by product cards, dashboard stat cards, admin table containers)
- Form input (used by checkout shipping form, profile form, product/category/coupon admin forms)
- Status badge (order status, payment status, stock status — each needs a consistent color mapping)
- Table row/header (shop product table is the only storefront table; admin has many — establish the pattern early in admin work)
- Primary/secondary/destructive button (Add to Cart, Place Order, Approve/Reject, Delete)

---

## Placeholder Pages

<!-- List page routes here once scaffolded with placeholder content, before full UI is built -->

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

#### ShopPage
- **File:** `app/(storefront)/shop/page.tsx`
- **Classes:**
  - Breadcrumb: `text-[13px] text-text-secondary` with active `text-text-primary font-medium`
  - Toolbar: `flex items-center justify-between mb-6`
  - Sort select: `bg-surface border border-border rounded-md px-3 py-2 pr-8 text-[13px] text-text-primary`
  - Product count: `text-[13px] text-text-secondary`
  - Mobile filter button: `lg:hidden flex items-center gap-2 px-3 py-2 text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary`
  - Main layout: `flex gap-8` with sidebar `w-[260px] shrink-0` and grid `flex-1 min-w-0`
- **Props:** none (internal state: filters, pagination, sort)
- **Behavior:** Client Component with full filtering logic (category, color, price, tags, stock), sorting, pagination. Mobile filter drawer. Empty state with icon + CTA.

#### ShopBanner
- **File:** `components/shop/ShopBanner.tsx`
- **Classes:**
  - Container: `bg-surface-secondary rounded-2xl overflow-hidden`
  - Label: `text-[12px] text-text-secondary uppercase tracking-wider font-medium`
  - Title: `font-[family-name:var(--font-serif)] text-[28px] lg:text-[36px] font-normal leading-[1.3] text-text-primary`
  - Link: `text-[13px] text-text-primary underline underline-offset-4 font-medium hover:text-text-secondary`
- **Props:** none
- **Behavior:** Promotional banner with text left, image right (hidden on mobile). Same pattern as FestiveBanner.

#### ShopProductCard
- **File:** `components/shop/ShopProductCard.tsx`
- **Classes:**
  - Card image: `w-full h-[220px] lg:h-[280px] bg-surface-secondary rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300`
  - Category: `text-[11px] text-text-muted uppercase tracking-wider`
  - Name: `text-[13px] font-medium text-text-primary leading-snug line-clamp-2`
  - Price: `text-[13px] font-semibold text-text-primary`
  - Out of Stock overlay: `absolute inset-0 bg-surface/80 flex items-center justify-center` with badge `bg-error-light text-error-foreground text-xs font-medium px-3 py-1 rounded-full`
  - Add To Cart button: `mt-3 border border-text-primary text-text-primary px-5 py-2 text-[12px] font-medium hover:bg-surface-inverse hover:text-text-inverse transition-colors rounded-md` (shown only when in stock)
- **Props:** `product: ShopProduct`
- **Behavior:** Follows homepage ProductCards pattern exactly. Add to Cart button shown only when in stock. Out of stock badge overlay on image.

#### FilterSidebar
- **File:** `components/shop/FilterSidebar.tsx`
- **Classes:**
  - Section heading: `text-[16px] font-semibold text-text-primary mb-4 pb-2 border-b border-border`
  - Category item: `text-[14px] font-medium text-text-secondary hover:text-text-primary` active `text-text-primary`
  - Price range: `relative h-1 bg-border rounded-full` with track `absolute h-1 bg-text-primary rounded-full`
  - Price labels: `text-[13px] text-text-primary font-medium`
  - Color dot: `w-3 h-3 rounded-full border` selected `border-text-primary ring-1 ring-text-primary ring-offset-1`
  - Tag pill: `px-3 py-1 text-[12px] font-medium rounded-md border` selected `bg-surface-inverse text-text-inverse border-surface-inverse` unselected `bg-surface text-text-secondary border-border hover:bg-surface-secondary`
  - Stock checkbox: `w-4 h-4 rounded border-border text-text-primary focus:ring-text-primary`
- **Props:** `selectedCategories`, `onCategoryToggle`, `priceRange`, `onPriceChange`, `selectedColors`, `onColorToggle`, `selectedTags`, `onTagToggle`, `inStockOnly`, `onInStockToggle`
- **Behavior:** Stateless filter UI. All interactions via callbacks. Sections: Category, Price, Color, Availability, Product Tags.

#### ActiveFilters
- **File:** `components/shop/ActiveFilters.tsx`
- **Classes:**
  - Chip: `inline-flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium bg-surface-secondary text-text-secondary border border-border rounded-full`
  - Remove button: `hover:text-text-primary transition-colors`
  - Clear all: `text-[12px] font-medium text-text-secondary underline underline-offset-2 hover:text-text-primary`
- **Props:** `filters: ActiveFilter[]`, `onRemove`, `onClearAll`
- **Behavior:** Renders removable filter chips. Hidden when no filters active. Clear All link resets all filters.

#### Pagination (compact variant)
- **File:** `components/ui/pagination.tsx`
- **Classes:**
  - Compact page: `w-8 h-8 text-[13px] font-medium rounded-md transition-colors flex items-center justify-center` active `bg-surface-inverse text-text-inverse` inactive `border border-border text-text-secondary hover:bg-surface-secondary`
  - Compact next: `w-8 h-8 flex items-center justify-center text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary disabled:opacity-50`
- **Props:** `variant?: 'default' | 'compact'`
- **Behavior:** Compact variant shows only page numbers + next arrow (no "Previous" text), matching shop design. Default variant unchanged.

#### CategoryBreadcrumb
- **File:** `components/category/CategoryBreadcrumb.tsx`
- **Classes:**
  - Nav: `flex items-center gap-2 text-[13px] text-text-secondary mb-6`
  - Link: `hover:text-text-primary transition-colors`
  - Active: `text-text-primary font-medium`
- **Props:** `ancestors: { name: string; slug: string }[]`, `currentName: string`
- **Behavior:** Renders Home > Ancestor1 > Ancestor2 > Current with ChevronRight separators. Ancestors are linked, current is plain text.

#### CategoryHero
- **File:** `components/category/CategoryHero.tsx`
- **Classes:**
  - Container: `bg-surface-secondary rounded-2xl overflow-hidden mb-8`
  - Label: `text-[12px] text-text-secondary uppercase tracking-wider font-medium`
  - Title: `font-[family-name:var(--font-serif)] text-[28px] lg:text-[36px] font-normal leading-[1.3] text-text-primary mt-2`
  - Description: `text-[14px] text-text-secondary mt-3 max-w-lg`
- **Props:** `name: string`
- **Behavior:** Shows "Category" label, category name in serif heading, and a description paragraph. Same pattern as ShopBanner/FestiveBanner but focused on category name.

#### CategoryPageClient
- **File:** `components/category/CategoryPageClient.tsx`
- **Classes:** Same layout pattern as ShopPageClient (bg-background, max-w-[1440px], sidebar w-[260px], product grid 3-col)
- **Additional:**
  - Subcategory cards: `bg-surface border border-border rounded-xl p-5 hover:bg-surface-secondary transition-colors`
  - Subcategory title: `text-[14px] font-medium text-text-primary`
  - Subcategory subtitle: `text-[12px] text-text-muted mt-1`
- **Props:** `categoryData: CategoryPageData`, `products: ShopProduct[]`, `total: number`, `page: number`, `totalPages: number`, `filterOptions: ShopFilterOptions`, `categorySlug: string`
- **Behavior:** Same URL-driven filter/sort/pagination as ShopPageClient. Category filter hidden from sidebar (page is already scoped to one category). Subcategories grid shown before product grid when category has children. Empty state matches shop pattern.

#### CategoryPageFallback
- **File:** `components/category/CategoryPageFallback.tsx`
- **Classes:** Same skeleton pattern as ShopPageClientFallback (sidebar skeletons + 6 product card skeletons)
- **Props:** none
- **Behavior:** Suspense fallback while category page data loads.

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

#### ProductDetailPage
- **File:** `components/product/ProductDetailPage.tsx`
- **Classes:**
  - Breadcrumb: `flex items-center gap-2 text-[13px] text-text-secondary mb-6` with active `text-text-primary font-medium`
  - Product title: `font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal leading-[1.3] text-text-primary`
  - Current price: `text-[24px] font-semibold text-text-primary`
  - Compare price: `text-[18px] text-text-muted line-through`
  - Short description: `text-[14px] text-text-secondary leading-relaxed`
  - Add to Cart button: `flex-1 h-10 bg-surface-inverse text-text-inverse text-[13px] font-medium rounded-md hover:bg-surface-inverse-hover disabled:opacity-50`
  - Wishlist button: `w-10 h-10 flex items-center justify-center border rounded-md` active `border-error text-error`, inactive `border-border text-text-secondary hover:border-border-strong`
  - Stock status dot: `w-2 h-2 rounded-full` colors: `bg-success` (in stock), `bg-warning` (low), `bg-error` (out)
  - SKU/Category row: `text-[13px] text-text-secondary` with label `font-medium text-text-primary`
- **Props:** `product: ProductDetail`, `relatedProducts: RelatedProduct[]`
- **Behavior:** Client component orchestrating variant selection, quantity, stock display, wishlist toggle, realtime stock updates, recently viewed saving. Updates price/stock/SKU based on selected variant attributes. Subscribes to Supabase Realtime for live stock/price changes via `useRealtimeStock`. Saves current product to localStorage recently viewed on mount.

#### ProductImageGallery
- **File:** `components/product/ProductImageGallery.tsx`
- **Classes:**
  - Thumbnail: `w-[80px] h-[100px] rounded-lg overflow-hidden border transition-colors` active `border-text-primary`, inactive `border-border hover:border-border-strong`
  - Main image: `flex-1 relative h-[500px] bg-surface-secondary rounded-lg overflow-hidden`
- **Props:** `variants: ProductVariant[]`, `productName: string`
- **Behavior:** Vertical thumbnail strip on left, main image on right. Click thumbnail to switch main image. Deduplicates images across variants. Sorts primary images first.

#### VariantSelector
- **File:** `components/product/VariantSelector.tsx`
- **Classes:**
  - Label: `text-[13px] font-medium text-text-primary block mb-2`
  - Pill button: `min-w-[48px] h-10 px-3 text-[13px] font-medium rounded-md border transition-colors` selected `bg-surface-inverse text-text-inverse border-surface-inverse`, unselected `bg-surface text-text-primary border-border hover:border-border-strong`
- **Props:** `attributes: ProductAttribute[]`, `variants: ProductVariant[]`, `selectedAttributes: Record<string, string>`, `onAttributeChange: (attributeId, valueId) => void`
- **Behavior:** Renders attribute groups (Size, Color, etc.) as rows of selectable pill buttons. Toggle selection on click.

#### QuantitySelector
- **File:** `components/product/QuantitySelector.tsx`
- **Classes:**
  - Container: `flex items-center border border-border rounded-md`
  - Buttons: `w-10 h-10 flex items-center justify-center text-text-secondary hover:text-text-primary disabled:opacity-50`
  - Value: `w-10 h-10 flex items-center justify-center text-[13px] font-medium text-text-primary border-x border-border`
- **Props:** `quantity: number`, `onChange: (quantity) => void`, `max?: number`
- **Behavior:** +/- stepper with min 1, optional max. Disables buttons at boundaries.

#### ProductTabs
- **File:** `components/product/ProductTabs.tsx`
- **Classes:**
  - Tab header: `flex border-b border-border`
  - Tab button: `pb-3 text-[14px] font-medium transition-colors relative` active `text-text-primary` with underline `h-0.5 bg-text-primary`, inactive `text-text-secondary hover:text-text-primary`
  - Tab badge: `ml-1 text-text-muted text-[12px]`
  - Tab content: `pt-6 space-y-3`
  - Spec row: `text-[14px] text-text-primary` with label `font-semibold capitalize` and value `text-text-secondary`
- **Props:** `product: ProductDetail`
- **Behavior:** Three tabs: Product description (shows specs as key-value list, falls back to description), Product info (shows brand, category, type, SKU, variant count), and Reviews (rating summary + review list + review form). Review tab shows count badge when > 0.

#### SizeChart
- **File:** `components/product/SizeChart.tsx`
- **Classes:**
  - Toggle: `text-[14px] font-semibold text-text-primary hover:text-text-secondary transition-colors`
  - Table header: `bg-surface-tertiary px-4 py-3 text-[12px] font-medium uppercase tracking-wide text-text-secondary`
  - Table row: `hover:bg-surface-secondary transition-colors px-4 py-3 text-[14px] text-text-primary`
- **Props:** `data?: SizeRow[]`, `title?: string`
- **Behavior:** Collapsible size chart table. Default data shows standard size measurements (Chest Round, Length, Shoulder, Sleeve).

#### ReviewSummary
- **File:** `components/product/ReviewSummary.tsx`
- **Classes:**
  - Average rating: `text-[40px] lg:text-[48px] font-semibold text-text-primary leading-none`
  - Stars: `text-[14px]` filled `text-text-primary`, empty `text-border`
  - Review count: `text-[12px] text-text-muted`
  - Distribution bar: `flex-1 h-1.5 bg-surface-secondary rounded-full overflow-hidden` with fill `h-full bg-text-primary rounded-full`
  - Distribution label: `text-[12px] text-text-secondary w-12`
  - Distribution count: `text-[12px] text-text-muted w-6 text-right`
  - Empty state: `text-center py-6` with `text-[14px] text-text-secondary`
- **Props:** `rating: number`, `reviewCount: number`, `reviews: ProductReview[]`
- **Behavior:** Shows large average rating with stars, 5-star distribution bar chart, or "No reviews yet" empty state. Flex row on desktop, stacked on mobile.

#### ReviewList
- **File:** `components/product/ReviewList.tsx`
- **Classes:**
  - List container: `space-y-4`
  - Review card: `border border-border rounded-lg p-4`
  - User name: `text-[13px] font-medium text-text-primary`
  - Stars: `text-[12px]` filled `text-text-primary`, empty `text-border`
  - Date: `text-[12px] text-text-muted`
  - Comment: `text-[14px] text-text-secondary leading-relaxed`
- **Props:** `reviews: ProductReview[]`
- **Behavior:** Renders individual review cards sorted by most recent. Shows user name, 5-star rating, date, and comment text. Returns null when empty.

#### ReviewForm
- **File:** `components/product/ReviewForm.tsx`
- **Classes:**
  - Container (auth-gated): `border border-border rounded-lg p-4`
  - Loading skeleton: `h-20 animate-pulse bg-surface-secondary rounded-md`
  - Guest message: `text-[14px] text-text-secondary mb-2` with CTA `border border-text-primary text-text-primary px-4 py-1.5 text-[13px] font-medium hover:bg-surface-inverse hover:text-text-inverse rounded-md`
  - Success: `bg-success-light` with `text-[14px] text-success-foreground font-medium`
  - Form heading: `text-[14px] font-medium text-text-primary mb-3`
  - Error: `text-[13px] text-error mb-3 bg-error-light px-3 py-2 rounded-md`
  - Star selector: `text-[20px]` active `text-text-primary`, inactive `text-border hover:text-text-primary`
  - Label: `block text-[12px] font-medium uppercase tracking-wide text-text-secondary mb-1.5`
  - Textarea: `w-full bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary resize-none`
  - Submit button: `bg-surface-inverse text-text-inverse text-[13px] font-medium px-5 py-2 rounded-md hover:bg-surface-inverse-hover disabled:opacity-50 transition-colors`
- **Props:** `productSlug: string`, `productId: string`
- **Behavior:** Three states: loading (skeleton), guest (Sign In link with redirect param), form (star selector + comment textarea + Submit). Calls `submitReviewAction` server action. Shows success message on completion. Validates rating selected and comment length ≥10.

#### RecentlyViewed
- **File:** `components/product/RecentlyViewed.tsx`
- **Classes:** Same card pattern as RelatedProducts (4-column grid, serif heading + subtitle, image card with hover zoom, category label, product name, price with compare-at strikethrough)
- **Props:** `currentProductId: string`
- **Behavior:** Reads from localStorage (`pandabdmart_recently_viewed`), filters out current product, shows max 6 items. Returns null when empty. ProductDetailPage saves current product to localStorage on mount.

#### RelatedProducts
- **File:** `components/product/RelatedProducts.tsx`
- **Classes:**
  - Section heading: `font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary text-center mb-2`
  - Subtitle: `text-[13px] text-text-secondary text-center mb-8`
  - Card image: `w-full h-[220px] lg:h-[280px] bg-surface-secondary rounded-lg overflow-hidden group-hover:scale-105 transition-transform duration-300`
  - Card name: `text-[13px] font-medium text-text-primary leading-snug line-clamp-2`
  - Card price: `text-[13px] font-semibold text-text-primary`
- **Props:** `products: RelatedProduct[]`
- **Behavior:** 4-column grid of related product cards. Uses same product card pattern as homepage/shop. Links to product detail pages.

#### FaqSection
- **File:** `components/product/FaqSection.tsx`
- **Classes:**
  - Section heading: `font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary text-center mb-2`
  - Subtitle: `text-[13px] text-text-secondary text-center mb-8`
  - Accordion item: `border border-border rounded-lg overflow-hidden`
  - Question button: `w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-secondary transition-colors`
  - Question text: `text-[14px] font-medium text-text-primary`
  - Toggle icon: `text-[16px] text-text-secondary ml-4 shrink-0` (`+` / `−`)
  - Answer: `px-5 pb-4 text-[14px] text-text-secondary leading-relaxed`
- **Props:** `items?: FaqItem[]`
- **Behavior:** Accordion with single-open behavior. 5 default FAQ questions about sizes, tailoring, payment, delivery, returns.

### Cart & Checkout

#### CartItemRow
- **File:** `components/cart/CartItemRow.tsx`
- **Classes:**
  - Image container: `shrink-0 w-24 h-24 lg:w-28 lg:h-28 rounded-lg overflow-hidden bg-surface-secondary`
  - Product name link: `text-[14px] font-medium text-text-primary leading-snug hover:text-text-secondary transition-colors line-clamp-2`
  - Variant attributes: `text-[12px] text-text-muted`
  - SKU: `text-[12px] text-text-muted`
  - Quantity stepper: `flex items-center border border-border rounded-md` with `w-8 h-8` buttons and `border-x` value
  - Line total: `text-[14px] font-semibold text-text-primary`
  - Compare price: `text-[12px] text-text-muted line-through`
  - Unit price: `text-[12px] text-text-muted`
  - Remove button: `p-1.5 text-text-muted hover:text-error transition-colors`
  - Low stock warning: `text-[12px] text-warning`
- **Props:** `item: CartItem`, `onQuantityChange: (variantId, quantity) => void`, `onRemove: (variantId) => void`
- **Behavior:** Renders a single cart item with quantity stepper (min 1, max stock), remove button, and pricing. Links to product detail page.

#### CartSummary
- **File:** `components/cart/CartSummary.tsx`
- **Classes:**
  - Card: `bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]`
  - Title: `text-base font-semibold text-text-primary leading-6`
  - Coupon input: `w-full bg-surface border border-border rounded-md pl-9 pr-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary`
  - Apply button: `bg-surface border border-border text-text-primary px-4 py-2 text-[13px] font-medium rounded-md hover:bg-surface-secondary disabled:opacity-50`
  - Subtotal: `text-[13px] text-text-secondary` / `text-[13px] font-medium text-text-primary`
  - Total: `text-[16px] font-semibold text-text-primary` / `text-[20px] font-semibold text-text-primary`
  - Checkout button: `block w-full bg-surface-inverse text-text-inverse text-center rounded-md px-4 py-3 text-[14px] font-medium hover:bg-surface-inverse-hover`
- **Props:** `summary: CartSummaryData`, `onCouponApply: (code: string) => void`
- **Behavior:** Order summary sidebar with promo code input, subtotal, shipping placeholder, grand total, and Proceed to Checkout button. Coupon display shows discount amount when applied.

#### EmptyCart
- **File:** `components/cart/EmptyCart.tsx`
- **Classes:**
  - Icon circle: `w-16 h-16 rounded-full bg-surface-secondary flex items-center justify-center`
  - Icon: `h-8 w-8 text-text-muted`
  - Text: `text-[14px] text-text-secondary` / `text-[13px] text-text-muted`
  - CTA: `bg-surface border border-border text-text-primary px-6 py-2.5 text-[13px] font-medium rounded-md hover:bg-surface-secondary`
- **Props:** none
- **Behavior:** Empty state with ShoppingCart icon, descriptive text, and Continue Shopping link to /shop.

#### CartPage
- **File:** `components/cart/CartPage.tsx` (client), `app/(storefront)/cart/page.tsx` (server)
- **Classes:** Same UI as Feature 10
- **Props:** `initialItems: CartItem[] | null`
- **Behavior:** `app/(storefront)/cart/page.tsx` is a server component — fetches authenticated cart items via `getCartItems()`, passes `initialItems` to `CartPageClient`. `CartPageClient` uses `useCart` hook for dual guest/auth cart management. Guest: items resolved from zustand store. Auth: items from server, mutations via server actions with optimistic UI updates. Applies coupons via `validateCouponAction` with toast feedback. Returns empty state when items.length === 0.

#### CheckoutPage
- **File:** `components/checkout/CheckoutPage.tsx` (client), `app/(storefront)/checkout/page.tsx` (server)
- **Classes:** Same card shell pattern as CartPage. Two-column layout: left `flex-1 min-w-0` (shipping form + zone selector), right `w-full lg:w-[420px] shrink-0` (order summary + payment + terms + place order)
- **Props:** `initialItems: CartItem[]`, `zones: ShippingZone[]`, `userEmail?: string`
- **Behavior:** Auth-gated server component. Client component manages all checkout state (shipping form, zone, payment method, coupon, terms). Validates before placing order. Shows empty state if cart is empty. Place Order currently shows toast — actual payment wiring in Feature 13/14.

#### ShippingForm
- **File:** `components/checkout/ShippingForm.tsx`
- **Classes:**
  - Section heading: `text-base font-semibold text-text-primary leading-6`
  - Form label: `block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5`
  - Input: `w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary`
  - Two-column grid: `grid grid-cols-1 sm:grid-cols-2 gap-4`
  - Three-column grid: `grid grid-cols-1 sm:grid-cols-3 gap-4`
- **Props:** `value: ShippingFormData`, `onChange: (value: ShippingFormData) => void`
- **Behavior:** Controlled form with name, phone, address, city, district, postal code.

#### ShippingZoneSelector
- **File:** `components/checkout/ShippingZoneSelector.tsx`
- **Classes:**
  - Radio card: `flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors` selected `border-text-primary bg-surface-secondary` unselected `border-border hover:border-border-strong`
  - Radio input: `w-4 h-4 text-text-primary border-border focus:ring-text-primary`
  - Zone name: `text-sm font-medium text-text-primary`
  - Cost: `text-sm font-semibold text-text-primary`
- **Props:** `zones: ShippingZone[]`, `selectedId: string | null`, `onChange: (zoneId: string) => void`
- **Behavior:** Radio card list for shipping zones. Inside Dhaka / Outside Dhaka pattern.

#### CheckoutOrderSummary
- **File:** `components/checkout/OrderSummary.tsx`
- **Classes:**
  - Card: `bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]`
  - Item image: `shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-surface-secondary`
  - Item name: `text-sm font-medium text-text-primary leading-snug hover:text-text-secondary transition-colors line-clamp-2`
  - Quantity stepper: `flex items-center border border-border rounded-md` with `w-7 h-7` buttons and `border-x` value
  - Price: `text-sm font-semibold text-text-primary`
  - Remove button: `p-1 text-text-muted hover:text-error transition-colors`
  - Coupon input: `w-full bg-surface border border-border rounded-md pl-9 pr-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary`
  - Apply button: `bg-surface border border-border text-text-primary px-4 py-2 text-[13px] font-medium rounded-md hover:bg-surface-secondary disabled:opacity-50`
  - Total: `text-[20px] font-semibold text-text-primary`
- **Props:** `items: CartItem[]`, `summary: CheckoutSummary`, `couponCode: string | null`, `discount: number`, `onQuantityChange`, `onRemove`, `onCouponApply`
- **Behavior:** Order summary sidebar with cart items (quantity stepper + remove), promo code, subtotal, shipping, discount, total. Similar to CartSummary but with inline item editing.

#### PaymentMethodSelector
- **File:** `components/checkout/PaymentMethodSelector.tsx`
- **Classes:**
  - Radio card: `flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors` selected `border-text-primary bg-surface-secondary` unselected `border-border hover:border-border-strong`
  - Method name: `text-sm font-medium text-text-primary`
  - Method subtitle: `text-xs text-text-muted mt-0.5`
- **Props:** `value: PaymentMethod`, `onChange: (method: PaymentMethod) => void`
- **Behavior:** Three radio cards: SSLCommerz (Pay online), bKash, Nagad.

#### MfsInstructions
- **File:** `components/checkout/MfsInstructions.tsx`
- **Classes:**
  - Container: `bg-surface-secondary border border-border rounded-xl p-4 space-y-4`
  - Heading: `text-sm font-medium text-text-primary mb-2`
  - Instructions: `text-sm text-text-secondary space-y-1.5 list-decimal list-inside`
  - Merchant number: `text-text-primary` (bold)
  - Input: `w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary`
- **Props:** `method: PaymentMethod`, `txnId: string`, `paymentNumber: string`, `onTxnIdChange`, `onPaymentNumberChange`
- **Behavior:** Shows bKash/Nagad payment instructions with merchant number, TxnID input, and payment number input.

<!-- useCart, cart.store, cart.repository, cart.service, cart.actions, cart/merge API -->

### Order Tracking

#### OrderStatusBadge
- **File:** `components/order/OrderStatusBadge.tsx`
- **Classes:** `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium` with status config mapping per ui-tokens.md canonical order status colors
- **Props:** `status: OrderStatus`, `className?: string`
- **Behavior:** Maps each of 8 order statuses to the canonical badge colors (pending/payment_pending → warning, paid/processing/shipped → info, delivered → success, cancelled/refunded → error). Single source of truth for status badge styling across the app.

#### OrderTimeline
- **File:** `components/order/OrderTimeline.tsx`
- **Classes:**
  - Step dot (current): `w-6 h-6 rounded-full bg-surface-inverse`
  - Step dot (completed): `w-6 h-6 rounded-full bg-success-light`
  - Step dot (future): `w-6 h-6 rounded-full bg-surface-tertiary`
  - Step icon (current): `w-3.5 h-3.5 text-text-inverse`
  - Step icon (completed): `w-3.5 h-3.5 text-success-foreground`
  - Step icon (future): `w-3.5 h-3.5 text-text-muted`
  - Connector line (completed): `w-px h-8 my-0.5 bg-success`
  - Connector line (future): `w-px h-8 my-0.5 bg-border`
  - Step label (active): `text-sm font-medium text-text-primary`
  - Step label (future): `text-sm text-text-muted`
  - Cancelled state: `w-6 h-6 rounded-full bg-error-light` with `XCircle` icon
- **Props:** `status: OrderStatus`, `paymentMethod: string`, `className?: string`
- **Behavior:** Linear timeline showing order journey. Adapts to payment method (hides "Payment Pending" step for COD orders). Shows cancelled state with red X icon and "Order Cancelled" message. Steps: Order Placed → Payment Pending (MFS only) → Payment Confirmed → Processing → Shipped → Delivered.

#### OrderItemsList
- **File:** `components/order/OrderItemsList.tsx`
- **Classes:**
  - Item row: `flex gap-4 p-3 bg-surface-secondary rounded-lg`
  - Image container: `shrink-0 w-16 h-16 rounded-md overflow-hidden bg-surface-tertiary`
  - Product name: `text-sm font-medium text-text-primary truncate`
  - SKU: `text-xs text-text-muted mt-0.5`
  - Quantity: `text-sm text-text-secondary`
  - Line total: `text-sm font-semibold text-text-primary shrink-0`
- **Props:** `items: OrderItemSnapshot[]`, `className?: string`
- **Behavior:** Renders order items with product_snapshot name, sku_snapshot, quantity, unit price, and line total. Shows placeholder image when no image_url in snapshot.

#### ShippingAddressDisplay
- **File:** `components/order/ShippingAddressDisplay.tsx`
- **Classes:**
  - Name: `text-sm font-medium text-text-primary`
  - Phone/Address: `text-sm text-text-secondary`
- **Props:** `shipping: OrderShipping`, `className?: string`
- **Behavior:** Simple display of shipping address fields.

#### CancelOrderButton
- **File:** `components/order/CancelOrderButton.tsx`
- **Classes:** Uses `Button` destructive variant with `XCircle` icon
- **Props:** `orderId: string`, `canCancel: boolean`
- **Behavior:** Client component. Only renders when `canCancel` is true (pending or payment_pending status). Confirms via browser dialog before calling `cancelOrderAction`. Shows loading state and error message. Self-hides after successful cancellation.

#### InvoiceDownloadButton
- **File:** `components/order/InvoiceDownloadButton.tsx`
- **Classes:** Uses `Button` secondary variant with `Download` icon
- **Props:** `orderId: string`
- **Behavior:** Client component. Calls `downloadInvoiceAction` which generates PDF via @react-pdf/renderer on the server. Creates blob URL for browser download. Shows loading state during generation and error message on failure.

#### GuestOrderLookup
- **File:** `components/order/GuestOrderLookup.tsx`
- **Classes:**
  - Card: `bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]`
  - Heading: `text-base font-semibold text-text-primary leading-6`
  - Subtitle: `text-sm text-text-secondary mb-6`
  - Form label: `block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5`
  - Input: `w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary`
  - Error: `text-sm text-error bg-error-light px-3 py-2 rounded-md`
- **Props:** `onOrderFound: (order: Order) => void`
- **Behavior:** Client component. Validates Order ID + email or phone before calling `guestLookupAction`. Shows inline error messages. Calls `onOrderFound` callback on success.

#### OrderTrackPage
- **File:** `components/order/OrderTrackPage.tsx`
- **Classes:** Same card shell and layout patterns as rest of app
- **Props:** none (reads orderId from useParams)
- **Behavior:** Main orchestrator client component. Three states:
  1. **Loading** — spinner while fetching order
  2. **Guest lookup** — shows `GuestOrderLookup` when not authenticated or order not found for current user
  3. **Order display** — two-column layout (main + sidebar) with:
     - Header: order ID, date, status badge, cancel + invoice buttons
     - Main: Order Timeline + Order Items
     - Sidebar: Order Summary (subtotal, shipping, discount, total), Shipping Address, Payment Info
     - Supabase Realtime subscription on `orders` table for live status updates (auto-updates badge and timeline)
  4. **Error state** — icon + message + "Try another order" link
- **Files also created:** `app/(storefront)/track/[orderId]/page.tsx` (server component wrapper with Suspense), `app/(storefront)/track/page.tsx` (standalone lookup page), `components/order/TrackPageClient.tsx`

#### Invoice PDF
- **File:** `lib/pdf/invoice.tsx`, `lib/pdf/render.tsx`
- **Library:** `@react-pdf/renderer` — uses `Document`, `Page`, `Text`, `View` components
- **Behavior:** Server-side only. Generates A4 PDF with store name, invoice title, order ID, date, shipping address, payment method, items table, totals breakdown, and footer. `renderInvoiceBuffer()` helper in `lib/pdf/render.tsx` wraps `renderToBuffer()` call.

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

### Shared UI Primitives

#### Button
- **File:** `components/ui/button.tsx`
- **Classes:**
  - Primary: `bg-surface-inverse text-text-inverse hover:bg-surface-inverse-hover disabled:opacity-50`
  - Secondary: `bg-surface border border-border text-text-primary hover:bg-surface-secondary disabled:opacity-50`
  - Destructive: `bg-surface border border-border text-error hover:bg-error-light disabled:opacity-50`
  - Ghost: `bg-transparent text-text-secondary hover:bg-surface-secondary disabled:opacity-50`
  - Sizes: sm `px-3 py-1.5 text-xs`, md `px-4 py-2 text-sm`, lg `px-6 py-3 text-sm`
  - Shell: `rounded-md font-medium transition-colors inline-flex items-center justify-center gap-2`
- **Props:** `variant?: 'primary' | 'secondary' | 'destructive' | 'ghost'`, `size?: 'sm' | 'md' | 'lg'`
- **Behavior:** Disabled state handled via `disabled:opacity-50`. All variants share the same border-radius and padding scale.

#### Input
- **File:** `components/ui/input.tsx`
- **Classes:** `w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary disabled:opacity-50 disabled:cursor-not-allowed`
- **Props:** standard HTML input props
- **Behavior:** Focus ring uses `text-primary` (black) per monochrome philosophy. No floating labels.

#### Select
- **File:** `components/ui/select.tsx`
- **Classes:**
  - Select: `w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary appearance-none focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary`
  - Chevron: `absolute inset-y-0 right-0 flex items-center px-2 text-text-secondary`
  - Label: `block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5`
  - Error: `border-error focus:ring-error focus:border-error` + `mt-1 text-xs text-error`
- **Props:** `label?: string`, `error?: string`, standard select props
- **Behavior:** Custom chevron icon overlay. Error state adds red border and message.

#### Badge
- **File:** `components/ui/badge.tsx`
- **Classes:**
  - Neutral: `bg-surface-secondary text-text-secondary border border-border`
  - Success: `bg-success-light text-success-foreground`
  - Warning: `bg-warning-light text-warning-foreground`
  - Error: `bg-error-light text-error-foreground`
  - Info: `bg-info-light text-info-foreground`
  - Primary: `bg-surface-inverse text-text-inverse`
  - Shell: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium`
- **Props:** `variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'primary'`
- **Behavior:** Pill-shaped by default. Used for status badges, tags, and labels.

#### Card
- **File:** `components/ui/card.tsx`
- **Classes:**
  - Root: `bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]`
  - Title: `text-base font-semibold text-text-primary leading-6`
  - Description: `text-sm text-text-secondary mt-1`
  - Footer: `mt-4 flex items-center gap-3`
- **Props:** `children`, plus subcomponents `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- **Behavior:** No hover states — static container. Used for stat cards, form containers, and admin panels.

#### Skeleton
- **File:** `components/ui/skeleton.tsx`
- **Classes:** `animate-pulse bg-surface-secondary rounded-md`
- **Props:** standard div props, plus `SkeletonText` (`lines?: number`) and `SkeletonCard` presets
- **Behavior:** Used for loading states across product grids, tables, and dashboards.

#### Table
- **File:** `components/ui/table.tsx`
- **Classes:**
  - Wrapper: `w-full overflow-x-auto`
  - Table: `w-full text-sm text-left`
  - Header: `bg-surface-tertiary`
  - Head cell: `px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary`
  - Body: `divide-y divide-border`
  - Row: `hover:bg-surface-secondary transition-colors`
  - Cell: `px-4 py-3 text-sm text-text-primary`
- **Props:** Subcomponents `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- **Behavior:** No alternating row colors. Hover state only. Used for admin tables and order history.

#### Pagination
- **File:** `components/ui/pagination.tsx`
- **Classes:**
  - Prev/Next: `px-3 py-1.5 text-[13px] font-medium border border-border rounded-md text-text-secondary hover:bg-surface-secondary disabled:opacity-50`
  - Page active: `w-8 h-8 text-[13px] font-medium rounded-md bg-surface-inverse text-text-inverse`
  - Page inactive: `w-8 h-8 text-[13px] font-medium rounded-md border border-border text-text-secondary hover:bg-surface-secondary`
- **Props:** `currentPage: number`, `totalPages: number`, `onPageChange: (page: number) => void`
- **Behavior:** Ellipsis for large page counts. Disabled Previous/Next at boundaries.

#### Modal
- **File:** `components/ui/modal.tsx`
- **Classes:**
  - Overlay: `fixed inset-0 z-50 flex items-center justify-center bg-overlay/50 p-4`
  - Content: `bg-surface border border-border rounded-2xl shadow-lg w-full max-w-lg animate-in fade-in zoom-in-95 duration-200`
  - Header: `flex items-center justify-between px-6 py-4 border-b border-border`
  - Title: `text-base font-semibold text-text-primary`
  - Close button: `p-1 text-text-secondary hover:text-text-primary transition-colors`
- **Props:** `isOpen: boolean`, `onClose: () => void`, `title?: string`, `children`
- **Behavior:** Client component. ESC key closes, click outside closes, body scroll locked. Enter/exit animation via `animate-in`.

#### Toast
- **File:** `components/ui/toast.tsx`
- **Classes:**
  - Container: `fixed bottom-4 right-4 z-50 flex flex-col gap-2`
  - Toast item: `flex items-center gap-3 px-4 py-3 rounded-md border shadow-lg min-w-[300px] max-w-md animate-in slide-in-from-right-4 fade-in duration-300`
  - Success: `bg-success-light text-success-foreground border-success`
  - Error: `bg-error-light text-error-foreground border-error`
  - Warning: `bg-warning-light text-warning-foreground border-warning`
  - Info: `bg-info-light text-info-foreground border-info`
- **Props:** `ToastProvider` wrapper + `useToast()` hook (`showToast(message, type?)`)
- **Behavior:** Auto-dismisses after 4 seconds. Manual dismiss via X button. Toast type determines border and background color. Used globally via `AppProviders` in root layout.

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

## Patterns — Shared UI Primitives (Imprinted 2026-06-13)

| Property | Class | Used By |
|----------|-------|---------|
| Primary button | `bg-surface-inverse text-text-inverse rounded-md px-4 py-2 text-sm font-medium hover:bg-surface-inverse-hover disabled:opacity-50` | Button, all forms, CTAs |
| Secondary button | `bg-surface border border-border text-text-primary rounded-md px-4 py-2 text-sm font-medium hover:bg-surface-secondary disabled:opacity-50` | Button, OAuth buttons, Cancel actions |
| Destructive button | `bg-surface border border-border text-error rounded-md px-4 py-2 text-sm font-medium hover:bg-error-light disabled:opacity-50` | Button, Reject, Cancel Order, Delete |
| Ghost button | `bg-transparent text-text-secondary hover:bg-surface-secondary rounded-md` | Button, icon-only actions |
| Form input | `w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-text-primary focus:border-text-primary` | Input, Select, auth forms, checkout |
| Form label | `block text-xs font-medium uppercase tracking-wide text-text-secondary mb-1.5` | Input, Select, all forms |
| Card shell | `bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]` | Card, stat cards, modal content |
| Status badge (success) | `bg-success-light text-success-foreground` | Badge, order status, stock status |
| Status badge (warning) | `bg-warning-light text-warning-foreground` | Badge, pending status, low stock |
| Status badge (error) | `bg-error-light text-error-foreground` | Badge, cancelled, out of stock, refunded |
| Status badge (info) | `bg-info-light text-info-foreground` | Badge, processing, shipped |
| Table header | `bg-surface-tertiary px-4 py-3 text-xs font-medium uppercase tracking-wide text-text-secondary` | Table, admin tables, order history |
| Table row | `hover:bg-surface-secondary transition-colors px-4 py-3 text-sm text-text-primary` | Table, admin tables |
| Skeleton | `animate-pulse bg-surface-secondary rounded-md` | Skeleton, loading states |
| Modal overlay | `fixed inset-0 z-50 bg-overlay/50 flex items-center justify-center` | Modal |
| Toast container | `fixed bottom-4 right-4 z-50 flex flex-col gap-2` | Toast |

**Pattern notes:**
- All form inputs share the same focus ring (`ring-text-primary`) and border style — never colored focus rings
- Button sizes are consistent: sm (compact), md (default), lg (hero/CTA)
- Card border-radius is always `rounded-2xl` (16px) unless inside a modal where it matches `rounded-2xl` as well
- Status badge colors are canonical — never invent new mappings per-component
- Table rows never use alternating colors — white-only with `hover:bg-surface-secondary`
- All interactive elements have `disabled:opacity-50` for disabled states

## Patterns — Product Detail Page (Imprinted 2026-06-15)

| Property | Class | Used By |
|----------|-------|---------|
| Product detail title (serif) | `font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal leading-[1.3] text-text-primary` | ProductDetailPage |
| Product current price | `text-[24px] font-semibold text-text-primary` | ProductDetailPage |
| Product compare price | `text-[18px] text-text-muted line-through` | ProductDetailPage |
| Variant pill (selected) | `min-w-[48px] h-10 px-3 text-[13px] font-medium rounded-md bg-surface-inverse text-text-inverse border-surface-inverse` | VariantSelector |
| Variant pill (unselected) | `min-w-[48px] h-10 px-3 text-[13px] font-medium rounded-md bg-surface text-text-primary border-border hover:border-border-strong` | VariantSelector |
| Quantity stepper | `flex items-center border border-border rounded-md` with `w-10 h-10` buttons and value | QuantitySelector |
| Stock status dot | `w-2 h-2 rounded-full` + `bg-success`/`bg-warning`/`bg-error` | ProductDetailPage |
| Section heading (serif, centered) | `font-[family-name:var(--font-serif)] text-[28px] lg:text-[32px] font-normal text-text-primary text-center mb-2` | RelatedProducts, FaqSection |
| Section subtitle (centered) | `text-[13px] text-text-secondary text-center mb-8` | RelatedProducts, FaqSection |
| Accordion item | `border border-border rounded-lg overflow-hidden` | FaqSection |
| Accordion question | `w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-secondary transition-colors` | FaqSection |

**Pattern notes:**
- Product detail page uses a two-column layout (55% image gallery, 45% product info) on desktop, stacked on mobile
- Image gallery uses vertical thumbnail strip (80px wide) on the left of the main image
- Variant selectors use pill buttons (not dropdowns) for Size, Color, etc.
- Quantity selector is a compact inline stepper (not a dropdown)
- Add to Cart button is full-width black (inverted) inside the quantity row
- Wishlist heart icon is a separate bordered button next to Add to Cart
- Stock status uses colored dots (8px) with text labels — never badges
- Related Products and FAQ sections share the same centered serif heading + subtitle pattern
- Size chart is a collapsible table following the same table pattern as admin tables

## Patterns — Checkout (Imprinted 2026-06-15)

| Property | Class | Used By |
|----------|-------|---------|
| Checkout page layout | `flex flex-col lg:flex-row gap-8` with left `flex-1 min-w-0` and right `w-full lg:w-[420px] shrink-0` | CheckoutPage |
| Checkout card shell | `bg-surface border border-border rounded-2xl p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.06),0px_1px_2px_-1px_rgba(0,0,0,0.06)]` | ShippingForm, ShippingZoneSelector, CheckoutOrderSummary, PaymentMethodSelector, MfsInstructions |
| Checkout section heading | `text-base font-semibold text-text-primary leading-6` | ShippingForm, ShippingZoneSelector, CheckoutOrderSummary, PaymentMethodSelector |
| Radio card (selected) | `flex items-center gap-4 p-4 border rounded-xl cursor-pointer border-text-primary bg-surface-secondary` | ShippingZoneSelector, PaymentMethodSelector |
| Radio card (unselected) | `flex items-center gap-4 p-4 border rounded-xl cursor-pointer border-border hover:border-border-strong` | ShippingZoneSelector, PaymentMethodSelector |
| Radio input | `w-4 h-4 text-text-primary border-border focus:ring-text-primary` | ShippingZoneSelector, PaymentMethodSelector |
| Checkout total | `text-[20px] font-semibold text-text-primary` | CheckoutOrderSummary |

**Pattern notes:**
- Checkout page uses the same card shell as CartSummary and other admin/stat cards
- Radio cards for shipping zones and payment methods share identical styling
- Order summary sidebar is wider than cart summary (`420px` vs `380px`) because it includes inline item editing
- MfsInstructions uses `bg-surface-secondary` inner container to distinguish instructions from the main card
- Place Order button is the same primary inverted pattern as Proceed to Checkout

Likely early candidates for shared patterns in this project:

- Card shell (used by product cards, dashboard stat cards, admin table containers, checkout sections)
- Form input (used by checkout shipping form, profile form, product/category/coupon admin forms)
- Status badge (order status, payment status, stock status — each needs a consistent color mapping)
- Table row/header (shop product table is the only storefront table; admin has many — establish the pattern early in admin work)
- Primary/secondary/destructive button (Add to Cart, Place Order, Approve/Reject, Delete)
- Radio card (shipping zone, payment method, possibly future admin settings)

---

## Placeholder Pages

<!-- List page routes here once scaffolded with placeholder content, before full UI is built -->

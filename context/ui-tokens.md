# UI Tokens

Design tokens for ShopName. All colors, typography, spacing, and component values defined here. Use these exact values throughout the codebase — never hardcode colors or use raw Tailwind color classes in components.

Palette: **black & white (monochrome)**, with a minimal functional color set reserved strictly for order/payment/stock status badges and rating stars (see ui-rules.md). Font: **General Sans**.

---

## How to Use

This project uses **Tailwind CSS v4**. All design tokens are defined using the `@theme` directive in `app/globals.css`. No `tailwind.config.ts` needed for colors or tokens.

Tailwind v4 automatically generates utility classes from `@theme` variables:

- `--color-text-primary` → `bg-text-primary`, `text-text-primary`, `border-text-primary`
- `--color-surface` → `bg-surface`, `text-surface`, `border-surface`

```tsx
// Correct — uses generated utility classes
className="bg-surface text-text-primary border-border"

// Also correct — references CSS variable directly
style={{ color: 'var(--color-text-primary)' }}

// Never — hardcoded hex values
className="bg-[#F6F7FB] text-[#101828]"

// Never — raw Tailwind color classes
className="bg-purple-500 text-gray-600"
```

---

## globals.css — Complete Token Definition

```css
@import 'tailwindcss';

@theme {
    /* Font */
    --font-sans: 'General Sans', sans-serif;

    /* Page and surface backgrounds */
    --color-background: #fafafa;
    --color-surface: #ffffff;
    --color-surface-secondary: #f5f5f5;
    --color-surface-tertiary: #f0f0f0;

    /* Borders */
    --color-border: #e5e7eb;
    --color-border-light: #f0f0f0;
    --color-border-strong: #d1d5db;

    /* Text */
    --color-text-primary: #0a0a0a;
    --color-text-secondary: #6b7280;
    --color-text-muted: #9ca3af;
    --color-text-inverse: #ffffff;

    /* Inverted surfaces (primary buttons, active nav) */
    --color-surface-inverse: #0a0a0a;
    --color-surface-inverse-hover: #262626;

    /* Functional — Success (green) */
    --color-success: #16a34a;
    --color-success-light: #dcfce7;
    --color-success-foreground: #15803d;

    /* Functional — Warning (amber) */
    --color-warning: #d97706;
    --color-warning-light: #fef3c7;
    --color-warning-foreground: #b45309;

    /* Functional — Info (blue) */
    --color-info: #2563eb;
    --color-info-light: #dbeafe;
    --color-info-foreground: #1d4ed8;

    /* Functional — Error (red) */
    --color-error: #dc2626;
    --color-error-light: #fee2e2;
    --color-error-foreground: #b91c1c;

    /* Dark overlays */
    --color-overlay: #0a0a0a;

    /* Border radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-full: 9999px;
}
```

Tailwind v4 generates utility classes automatically from every `--color-*` token above:

- `bg-text-primary`, `text-text-primary`, `border-text-primary`
- `bg-surface`, `bg-surface-secondary`
- `bg-success-light`, `text-success-foreground`
- etc.

---

## Color Usage Guide

### Page Layout

| Element                                          | Token                  |
| ------------------------------------------------ | ---------------------- |
| Page background                                  | `bg-background`        |
| Card / surface                                   | `bg-surface`           |
| Secondary surface                                | `bg-surface-secondary` |
| Tertiary surface (e.g. table header)             | `bg-surface-tertiary`  |
| Default border                                   | `border-border`        |
| Light border                                     | `border-border-light`  |
| Strong border (dividers, focus outlines on dark) | `border-border-strong` |

### Typography

| Element                             | Token                           |
| ----------------------------------- | ------------------------------- |
| Headings, primary text              | `text-text-primary` (#0A0A0A)   |
| Secondary text, labels              | `text-text-secondary` (#6B7280) |
| Placeholder, muted                  | `text-text-muted` (#9CA3AF)     |
| Text on inverted surfaces (buttons) | `text-text-inverse` (#FFFFFF)   |

### Inverted Surfaces (Primary Actions)

Used for: primary buttons (Add to Cart, Place Order, Save), active sidebar items, logo mark.

| Element                   | Token                      |
| ------------------------- | -------------------------- |
| Primary button background | `bg-surface-inverse`       |
| Primary button hover      | `bg-surface-inverse-hover` |
| Primary button text       | `text-text-inverse`        |

### Order / Payment Status Colors

| Status                                                                  | Token (background / text)                      |
| ----------------------------------------------------------------------- | ---------------------------------------------- |
| Pending / Payment Pending                                               | `bg-warning-light` / `text-warning-foreground` |
| Paid / Processing / Shipped / Delivered                                 | `bg-success-light` / `text-success-foreground` |
| Processing / Shipped (alternate, if distinguishing from Paid/Delivered) | `bg-info-light` / `text-info-foreground`       |
| Cancelled / Refunded                                                    | `bg-error-light` / `text-error-foreground`     |

Use a single consistent mapping per status across the whole app — see the table below for the canonical mapping.

### Canonical Order Status Badge Mapping

| `orders.status`   | Token (background / text)                      |
| ----------------- | ---------------------------------------------- |
| `pending`         | `bg-warning-light` / `text-warning-foreground` |
| `payment_pending` | `bg-warning-light` / `text-warning-foreground` |
| `paid`            | `bg-info-light` / `text-info-foreground`       |
| `processing`      | `bg-info-light` / `text-info-foreground`       |
| `shipped`         | `bg-info-light` / `text-info-foreground`       |
| `delivered`       | `bg-success-light` / `text-success-foreground` |
| `cancelled`       | `bg-error-light` / `text-error-foreground`     |
| `refunded`        | `bg-error-light` / `text-error-foreground`     |

### Stock Status Colors

| Stock State                         | Token (background / text)                      |
| ----------------------------------- | ---------------------------------------------- |
| In Stock                            | `bg-success-light` / `text-success-foreground` |
| Low Stock (≤ `LOW_STOCK_THRESHOLD`) | `bg-warning-light` / `text-warning-foreground` |
| Out of Stock                        | `bg-error-light` / `text-error-foreground`     |

### Skills / Tags / Generic Badges

| Type                                     | Background             | Text                      |
| ---------------------------------------- | ---------------------- | ------------------------- |
| Neutral tag (category, brand, attribute) | `bg-surface-secondary` | `text-text-secondary`     |
| Coupon applied badge                     | `bg-success-light`     | `text-success-foreground` |

### Source / Method Badges

| Type                         | Background             | Text                  |
| ---------------------------- | ---------------------- | --------------------- |
| SSLCommerz                   | `bg-surface-secondary` | `text-text-secondary` |
| bKash / Nagad                | `bg-surface-secondary` | `text-text-secondary` |
| Inside Dhaka / Outside Dhaka | `bg-surface-secondary` | `text-text-secondary` |

All payment/shipping method badges are neutral monochrome — these are informational, not status indicators, and don't need functional colors.

---

## Typography

| Element                               | Size | Weight | Line height | Color token                       |
| ------------------------------------- | ---- | ------ | ----------- | --------------------------------- |
| Logo text                             | 19px | 700    | 28px        | `text-text-primary`               |
| Stat number (admin dashboard)         | 30px | 600    | 36px        | `text-text-primary`               |
| Product price (current)               | 24px | 700    | 32px        | `text-text-primary`               |
| Product price (compare-at)            | 14px | 400    | 20px        | `text-text-muted` (strikethrough) |
| Section heading                       | 16px | 600    | 24px        | `text-text-primary`               |
| Nav item (active)                     | 14px | 500    | 20px        | `text-text-primary`               |
| Nav item (inactive)                   | 14px | 500    | 20px        | `text-text-secondary`             |
| Card label                            | 14px | 500    | 20px        | `text-text-secondary`             |
| Body / content text                   | 14px | 500    | 20px        | `text-text-primary`               |
| Trend badge text                      | 12px | 500    | 16px        | `text-success-foreground`         |
| Timestamp / muted                     | 12px | 400    | 16px        | `text-text-muted`                 |
| Chart axis labels                     | 12px | 400    | 15px        | `text-text-muted`                 |
| Form label (uppercase, tracking-wide) | 12px | 500    | 16px        | `text-text-secondary`             |
| SKU / variant attribute label         | 12px | 400    | 16px        | `text-text-muted`                 |

Font family: **General Sans** — import via `next/font/local` (see ui-rules.md).

---

## Spacing

| Token         | Value      | Usage                                      |
| ------------- | ---------- | ------------------------------------------ |
| `gap-1`       | 4px        | Tight inline gaps                          |
| `gap-2`       | 8px        | Badge and tag gaps                         |
| `gap-3`       | 12px       | Form field gaps                            |
| `gap-4`       | 16px       | Section internal gaps                      |
| `gap-6`       | 24px       | Between sections                           |
| `gap-8`       | 32px       | Page section gaps                          |
| `p-4`         | 16px       | Card padding (compact, e.g. cart item row) |
| `p-6`         | 24px       | Large card padding (default)               |
| `px-4 py-2`   | 16px / 8px | Button padding                             |
| `px-2 py-0.5` | 8px / 2px  | Badge padding                              |

---

## Component Tokens

### Cards

```
background: bg-surface
border: 1px solid var(--color-border)
border-radius: 16px (rounded-2xl in Tailwind)
padding: 24px (p-6)
box-shadow: 0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.06)
```

### Buttons

**Primary (inverted):**

```
background: bg-surface-inverse
text: text-text-inverse
border-radius: rounded-md
padding: px-4 py-2
font-weight: font-medium
hover: bg-surface-inverse-hover
```

**Secondary (outline):**

```
background: bg-surface
border: border border-border
text: text-text-primary
border-radius: rounded-md
padding: px-4 py-2
hover: bg-surface-secondary
```

**Destructive (outline, red text):**

```
background: bg-surface
border: border border-border
text: text-error
border-radius: rounded-md
padding: px-4 py-2
hover: bg-error-light
```

**Ghost:**

```
background: transparent
text: text-text-secondary
hover: hover:bg-surface-secondary
border-radius: rounded-md
```

### Input Fields

```
background: bg-surface
border: border border-border
border-radius: rounded-md
padding: px-3 py-2
text: text-text-primary
placeholder: text-text-muted
focus: ring-1 ring-text-primary border-text-primary
```

### Badges

```
border-radius: rounded-full
padding: px-2 py-0.5
font-size: text-xs
font-weight: font-medium
```

### Stock / Rating Indicator Dots

```
size: 8px
border-radius: rounded-full
color: token per stock state (see Stock Status Colors above)
```

### Rating Stars

```
filled: text-text-primary (black)
empty: text-border
size: 16px (h-4 w-4)
```

### Trend Badges (admin stat cards)

```
positive: bg-success-light / text-success-foreground
negative: bg-error-light / text-error-foreground
border-radius: 4px (rounded-sm)
padding: 2px 8px
font-size: 12px
font-weight: 500
```

### Recent Activity Dots (admin dashboard)

| Activity Type                      | Outer ring         | Inner dot    |
| ---------------------------------- | ------------------ | ------------ |
| New order placed                   | `bg-info-light`    | `bg-info`    |
| Payment verified                   | `bg-success-light` | `bg-success` |
| Payment rejected / order cancelled | `bg-error-light`   | `bg-error`   |
| Low stock alert                    | `bg-warning-light` | `bg-warning` |

Dot size: 8px inner, 16px outer with white border.

### Admin Dashboard Chart Colors

| Chart                                                  | Color                                                            |
| ------------------------------------------------------ | ---------------------------------------------------------------- |
| Revenue Over Time (line)                               | `#0A0A0A` stroke, 3px width, gradient fill `rgba(10,10,10,0.06)` |
| Orders Count (bars)                                    | `#6B7280`                                                        |
| Match/conversion or stock distribution (bars, if used) | `#16A34A`                                                        |
| Chart grid lines                                       | `1px dashed var(--color-border)`                                 |
| Chart axis labels                                      | `var(--color-text-muted)`, 12px                                  |

### Logo

```
background: var(--color-surface-inverse)  /* solid black, no gradient */
color: var(--color-text-inverse)          /* white wordmark/icon */
border-radius: 10px
size: 36x36px
```

---

## Invariants

- Never use hex values directly in components — always use CSS variables via Tailwind tokens
- Font is General Sans — always import via `next/font/local`, never use a fallback system font
- Never use raw Tailwind color classes like `bg-purple-500` or `text-gray-600` — use project tokens only
- This project has **no brand accent color** — primary buttons, active states, and the logo all use `--color-surface-inverse` (black) and `--color-text-inverse` (white). Never introduce a colored "accent" token.
- Functional colors (`success`, `warning`, `info`, `error`) are restricted to: order/payment status badges, stock status indicators/dots, and trend badges. Never used for buttons, links, navigation, or card backgrounds.
- Rating stars are always black (`text-text-primary`) when filled — never yellow/gold
- All borders default to `--color-border` — never use `border-gray-*`
- The canonical order status badge mapping table above is the single source of truth — never invent new status colors per-component

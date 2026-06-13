# UI Rules

Concise rules for building ShopName UI. These rules cover the most important patterns and constraints to keep the UI consistent without over-specifying every detail.

---

## Font

Always import General Sans via `next/font/local` (or `next/font/google` if available as a Google Font variant) in the root layout.

```typescript
import localFont from 'next/font/local';

const generalSans = localFont({
    src: [
        {
            path: './fonts/GeneralSans-Regular.woff2',
            weight: '400',
            style: 'normal',
        },
        {
            path: './fonts/GeneralSans-Medium.woff2',
            weight: '500',
            style: 'normal',
        },
        {
            path: './fonts/GeneralSans-Semibold.woff2',
            weight: '600',
            style: 'normal',
        },
        {
            path: './fonts/GeneralSans-Bold.woff2',
            weight: '700',
            style: 'normal',
        },
    ],
    variable: '--font-sans',
});
```

The `--font-sans` variable is declared in `@theme` in globals.css. Apply the font variable class to the `<html>` tag in root layout. Never use system fonts as the primary font.

---

## Color Philosophy — Black & White

This project uses a strict black-and-white (monochrome) palette. No brand accent color (no purple, blue, green as a "primary" hue). All emphasis, hierarchy, and interactivity is conveyed through:

- Shades of black/gray (text, borders, surfaces)
- Weight and size (typography hierarchy)
- Inversion (black background + white text for primary actions/buttons)
- Outline vs filled states

**Functional colors (status only)** — a minimal, desaturated set is still needed for order status, stock status, and match/rating indicators, since pure grayscale cannot communicate "error" vs "success" vs "pending" accessibly. These are used **only** for status badges, stock indicators, and rating stars — never for buttons, links, navigation, or card backgrounds:

- Success (Paid, Delivered, In Stock): `#16A34A`
- Warning (Pending, Low Stock): `#D97706`
- Error (Cancelled, Out of Stock, Refunded): `#DC2626`
- Info (Processing, Shipped): `#2563EB`

Apply these only as text/badge colors at low opacity backgrounds (e.g. `bg-success/10 text-success`) — never as full-color fills, never as card backgrounds, never as buttons.

---

## Layout

- Page max-width: 1440px, centered
- Main content area padding: 32px on all sides (16px on mobile)
- Gap between page sections: 24px
- Header height: 64px, full width, white background, padding 0 24px
- Storefront: top navbar only, no sidebar
- Customer dashboard `(dashboard)`: top navbar + left sidebar (240px)
- Admin `(admin)`: top navbar + left sidebar (240px), collapsible on smaller screens

---

## Navbar (Storefront)

Logo, Shop, Categories, Cart icon (with badge), Account/Login.

- Active item: `color: var(--color-text-primary)` (near-black), font-weight 500, 14px, with a 2px bottom border in `var(--color-text-primary)`
- Inactive item: `color: var(--color-text-secondary)` (mid-gray), font-weight 500, 14px, transparent bottom border
- Navbar always white background (`var(--color-surface)`), full viewport width, border-bottom `1px solid var(--color-border)`
- Cart badge: small black circle, white text, positioned top-right of cart icon — `bg-text-primary text-white text-[10px] rounded-full h-4 min-w-4 px-1`

---

## Cards

Every content section lives in a card.

```
background: #FFFFFF (var(--color-surface))
border: 1px solid #E5E7EB (var(--color-border))
border-radius: 16px
padding: 24px
box-shadow: 0px 1px 3px rgba(0,0,0,0.06), 0px 1px 2px -1px rgba(0,0,0,0.06)
```

Never use colored card backgrounds — always white. Color (functional status colors only) goes inside cards via badges, never on the card surface itself.

---

## Typography Hierarchy

Three levels used consistently throughout:

**Section headings** — card titles, page section titles

```
font-size: 16px
font-weight: 600
color: #0A0A0A (var(--color-text-primary))
line-height: 24px
```

**Body / primary content text**

```
font-size: 14px
font-weight: 500
color: #0A0A0A (var(--color-text-primary))
line-height: 20px
```

**Secondary / muted text** — labels, timestamps, prices subtext, SKU

```
font-size: 12px
font-weight: 400
color: #9CA3AF (var(--color-text-muted))
line-height: 16px
```

Stat numbers (admin dashboard) and product price use 24-30px / weight 600-700 / `var(--color-text-primary)`.

Product price emphasis: current price `font-weight: 700`, compare-at price `font-weight: 400`, `color: var(--color-text-muted)`, `text-decoration: line-through`.

---

## Badges

All badges use `border-radius: 9999px` (pill shape) unless specified otherwise.

```
padding: 2px 8px
font-size: 12px
font-weight: 500
```

**Order/payment status badges** use the functional colors at 10% opacity background:

| Status                              | Background      | Text           |
| ----------------------------------- | --------------- | -------------- |
| Pending / Payment Pending           | `bg-warning/10` | `text-warning` |
| Paid / Delivered / In Stock         | `bg-success/10` | `text-success` |
| Processing / Shipped                | `bg-info/10`    | `text-info`    |
| Cancelled / Refunded / Out of Stock | `bg-error/10`   | `text-error`   |

**Source badges (Search/URL, Inside/Outside Dhaka, In Stock/Out of Stock generic labels)** use neutral monochrome:

```
background: var(--color-surface-secondary)
border: 1px solid var(--color-border)
color: var(--color-text-secondary)
```

Trend badges on admin stat cards use `border-radius: 4px` (not pill), `bg-success/10 text-success` for positive, `bg-error/10 text-error` for negative.

---

## Buttons

**Primary button** — inverted black/white, used for the main action on a page (Add to Cart, Place Order, Save Profile, Approve):

```
background: var(--color-text-primary)  /* near-black */
color: var(--color-surface)            /* white */
border-radius: 8px
padding: 8px 16px
font-size: 14px
font-weight: 500
hover: opacity 90%
```

**Secondary button** — outline, used for alternate actions (Continue Shopping, Reject, Cancel, View Details):

```
background: var(--color-surface)
border: 1px solid var(--color-border)
color: var(--color-text-primary)
border-radius: 8px
padding: 8px 16px
hover: background var(--color-surface-secondary)
```

**Destructive button** — only Reject Payment, Cancel Order, Delete actions. Uses `text-error` text on a secondary-button shell, never a filled red button:

```
background: var(--color-surface)
border: 1px solid var(--color-border)
color: var(--color-error)
border-radius: 8px
padding: 8px 16px
hover: background: var(--color-error)/5
```

---

## Form Inputs

```
background: #FFFFFF (var(--color-surface))
border: 1px solid #E5E7EB (var(--color-border))
border-radius: 8px
padding: 8px 12px
font-size: 14px
color: var(--color-text-primary)
placeholder color: var(--color-text-muted)
focus: ring-1 ring-text-primary border-text-primary
```

Focus ring is black (`ring-text-primary`), not a colored accent — consistent with the monochrome philosophy.

---

## Tables (Admin & Order History)

- No alternating row colors — white rows only, separated by border
- Row border: `1px solid var(--color-border)` between rows
- Column headers: uppercase, 12px, font-weight 500, `color: var(--color-text-secondary)`
- Row text: 14px, `color: var(--color-text-primary)`
- Hover state: `background: var(--color-surface-secondary)`

---

## Rating Stars

Filled star: `var(--color-text-primary)` (black) — never yellow/gold, to stay within the monochrome palette. Empty star: `var(--color-border)`.

---

## Stock / Match Indicators

**Stock status dot** (product cards, variant selector): 8px circle.

- In Stock: `bg-success`
- Low Stock: `bg-warning`
- Out of Stock: `bg-error`

**Variant stock progress bar** (admin, if shown): same shape as below, fill color reflects stock level relative to `LOW_STOCK_THRESHOLD`.

Inline progress bar shown next to a percentage/quantity number:

```
height: 4px
border-radius: 9999px
background track: var(--color-border)
```

---

## Empty States

Every section that can be empty must have an empty state. Keep it minimal:

- Short descriptive text in `color: var(--color-text-muted)`
- Optional icon above text, `color: var(--color-text-muted)`, `h-12 w-12`, inside a `bg-surface-secondary` circle
- CTA button (secondary style) if there's a logical next action (e.g. "Continue Shopping" on empty cart)

---

## Tailwind v4 Note

This project uses Tailwind v4. Tokens are defined with `@theme` in globals.css — no `tailwind.config.ts` needed. Never define colors in a config file. Always use `@theme` for new tokens.

---

## Do Nots

- Never use Tailwind's built-in color classes (`bg-purple-500`, `text-gray-600`, `bg-blue-500`) — use project tokens only (`var(--color-*)` via `@theme`)
- Never define colors in `tailwind.config.ts` — use `@theme` in globals.css
- Never add gradients to card backgrounds, buttons, or the navbar
- Never use functional status colors (success/warning/error/info) outside of badges, stock indicators, and rating context — buttons, links, and navigation stay monochrome
- Never use more than one font weight in a single UI element
- Never show raw error messages to users — always show human readable text
- Never stack more than 2 levels of border radius inside each other
- Never use `position: fixed` for UI elements except the storefront navbar (`sticky top-0`)
- Never use yellow/gold for rating stars — use filled black stars per the monochrome palette

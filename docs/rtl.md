# RTL rules for Salla themes

Most Salla shoppers read Arabic, so a Salla theme is right-to-left first and left-to-right second.
The engine renders `<html lang dir>` from the request locale (`/ar` → `dir="rtl"`, `/en` →
`dir="ltr"`, see `app/routes/__root.tsx`). Everything below follows from that one attribute.

## Use logical utilities, not left and right

Tailwind has a logical twin for every physical utility. Use the logical one, and the layout mirrors
by itself:

| Instead of                   | Use                              |
| ---------------------------- | -------------------------------- |
| `ml-*` / `mr-*`              | `ms-*` / `me-*`                  |
| `pl-*` / `pr-*`              | `ps-*` / `pe-*`                  |
| `left-*` / `right-*`         | `start-*` / `end-*`              |
| `text-left` / `text-right`   | `text-start` / `text-end`        |
| `border-l` / `border-r`      | `border-s` / `border-e`          |
| `rounded-l-*` / `rounded-r-*`| `rounded-s-*` / `rounded-e-*`    |

In SCSS, use `margin-inline-start`, `padding-inline-end`, `inset-inline-start` and
`text-align: start`.

`tests/styles/logical-classes.test.ts` fails when a component in `app/components` uses a physical
utility. When something really is physical (a transform, an icon that must point one way), say so
with an explicit `ltr:` / `rtl:` variant; the test allows those.

## Things that do not mirror by themselves

- **Transforms.** `translate-x` is physical. A panel centred with `start-1/2` needs
  `ltr:-translate-x-1/2 rtl:translate-x-1/2` (see `app/components/ui/dialog.tsx`); a plain
  `-translate-x-1/2` pushes it off screen in RTL.
- **Directional icons.** Arrows and chevrons that mean "next" or "back" flip with
  `rtl:-scale-x-100`. Icons that are not directional (search, cart, close) stay as they are.
- **Flex order is already logical.** `flex-row` starts at the right in RTL; don't add
  `flex-row-reverse` for Arabic. Reach for `ltr:`/`rtl:` only when a widget must read the same way
  in both directions (a quantity stepper reading − 1 +, for example). Salla's
  `salla-quantity-input` puts "+" on the left in LTR; `[dir='ltr'] .s-quantity-input-container
  { flex-direction: row-reverse }` fixes it.
- **Carousels and scroll positions.** `scrollLeft` is negative or reversed in RTL depending on the
  browser. Prefer `scrollIntoView` or `scrollBy` with `inline` alignment, and test swipes in both
  directions.
- **Popovers.** Radix (Select, Dialog, Dropdown) reads `dir` from the nearest ancestor, so the
  primitives in `app/components/ui` align correctly. Pass `dir` on the root when a widget must
  use a specific one.

## Text and numbers

- Latin-only values (email, phone, URL, coupon code, card number) can take `dir="ltr"` on the input
  so they type naturally, but keep `text-start` so they line up with the Arabic label.
- Prices: render them with the engine's `useMoney().format()` (it returns a React node, not a
  string) and let the store's currency settings decide the symbol. Don't write «ر.س» or "SAR"
  yourself.
- Don't put Arabic and Latin in one string and hope the order holds. Split them into elements, or
  wrap the embedded run in `<bdi>`.

## Fonts

The Salla SDK sets the store's font as `--font-main` and its Arabic face as `--font-ar`; RTL pages
switch to the Arabic one (`app/styles/app.css`). The fallback stack (Tailwind `font-sans`) lists
system fonts that cover Arabic script on each platform (`Segoe UI`, `Tahoma`, `Geeza Pro`,
`Noto Sans Arabic`) before the generic sans, so text never drops to a serif while the store font
loads, or when it has no Latin glyphs. Arabic needs more line height than Latin: keep body text at
`leading-relaxed` or more, and check that diacritics and the tails of letters like «ي» are not
clipped in buttons and badges with a fixed height.

## Translations

Every user-facing string goes in both `locales/ar.json` and `locales/en.json` under the same key.
`pnpm check:locales` fails when a key is missing in one file or a value is empty. Icon-only buttons
need a translated `aria-label` too (the `Dialog` primitive requires `closeLabel` for that reason).

## Check

Open every page at `/ar` and at `/en` (never `/`), on a phone width and a desktop width.
`pnpm qa` does exactly that and reports horizontal overflow, the usual sign of a physical margin or
a translate that did not flip.

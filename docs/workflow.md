# Workflow: from new theme to the Theme Store

The path one theme takes, in order. Salla's own pages are the reference for anything that changes:
[Twilight React docs](https://docs.salla.dev/twilight/react),
[review requirements](https://docs.salla.dev/twilight/react/local-development/review-requirements.md)
and [design requirements](https://docs.salla.dev/twilight/react/local-development/design-requirements.md).

## 1. Start the theme

```bash
git clone https://github.com/zuandabaransyahputra/salla-react-starter my-theme
cd my-theme && rm -rf .git && git init
pnpm install
pnpm new-theme --name-en "Mawj" --name-ar "موج" \
  --repo https://github.com/<you>/mawj --email you@example.com
pnpm check:manifest && pnpm build && pnpm typecheck && pnpm test
```

`new-theme` sets the name, repository, author email and support URL in `twilight.json`, gives
every custom home block a fresh `key` (keys must not repeat another theme's), and renames the
package. Write `twilight.json` → `description` (ar and en) yourself.

**Settle the name before any design work.** Names already used by another theme are rejected, and
the review has rules for the selling name: one word, under 14 letters, no spaces or emoji, not an
industry word, a Salla product or brand name, or a marketing word. Arabic and English are checked
separately. The reliable test is the import itself (Partners Portal → Themes → Create → Import
From GitHub): the error names the clashing name. Logos and icons built on a name that later gets
rejected have to be redone.

## 2. Develop against a demo store

- Create a demo store in the Partners Portal (Stores → Demo Stores). Give each theme its own store,
  and never copy another theme's `.env`: the dev server would read, and your scripts would write
  to, the wrong store.
- `salla theme dev` (Salla CLI) writes a `.env` with `VITE_STORE_DOMAIN`, the store the dev server
  reads, and `VITE_TWILIGHT_URL`, the fallback twilight SDK build used only when the store's
  settings don't pin a release. Then run `pnpm dev`.
- Open pages at `/ar` or `/en`, never `/`.
- Demo stores show visitors a maintenance page. Open the merchant view once with
  `?utm_source=dashboard&identifier=<store-id>` to see the theme.
- The dev-only settings widget (gear button) and the local editor (`/__twilight/editor`) read
  `twilight.json`, so you can try settings and home blocks without the Portal.
- Fill the demo store with real-looking content, in Arabic and English. Turn English on first
  (Settings → Languages, then clear the cache): English translations saved while it is off are
  not kept. The content must not mention the theme itself.
- The review expects the default demo store to show: a discount with a countdown, loyalty, the
  blog, discounted products, an out-of-stock product and a product with options.

## 3. QA

```bash
pnpm check:manifest && pnpm check:locales
pnpm build && pnpm typecheck && pnpm test
pnpm qa                         # while pnpm dev runs
```

`pnpm qa` captures every page in the matrix desktop/phone × ar/en × light/dark and flags horizontal
overflow and console errors (see the header of `scripts/qa/qa.mjs` for the variables). Against a
demo store in maintenance, add `QA_MERCHANT=<store-id>`. For an interaction (open a menu, type in
search), pass a shot list with a `before` script.

Check RTL with [docs/rtl.md](rtl.md) in mind: overflow in `/ar` only usually means a physical
margin or a translate that did not flip.

## 4. Lighthouse

Performance numbers from `pnpm dev` mean nothing. Build and serve production locally:

```bash
pnpm build && pnpm preview --port 5180
pnpm lighthouse "http://localhost:5180/ar" "/ar/<category-path>" "/ar/<product-path>"
```

Add `LH_MERCHANT=<store-id>` when the store is in maintenance. Reports land in `.lighthouse/`.
On localhost a few audits always fail and are not the theme's: CORS on `/_app/e/api/s/page`,
`getServerSnapshot` from the engine, and `robots.txt`. If the store API answers 429 (too many
requests), the run is not valid; wait and repeat.

The review takes the average for the home, a category and a product page on the default demo
store, desktop and mobile: at least 60 for performance and 90 for accessibility.

## 5. Listing

In the Partners Portal, for the theme:

- Description in Arabic and English, logo and theme icon.
- At least 4 screenshots (the Portal takes at most 6), desktop and mobile: 1600×1200 JPEG under
  200 KB, title up to 30 characters and description up to 100, in both languages, with no extra
  text or logos on the image.
- A preview store (Listings → Preview Stores).
- Individual partner accounts need ID verification before publishing.

## 6. Submit for review

- The public theme must stay under 1 MB. Docs, tests and dev scripts are not needed to build it;
  keep the repository you connect to the Portal lean.
- Salla builds the theme on its own infrastructure when you submit it: push to the theme's
  repository and the platform takes it from there. No deploy configuration ships with the theme.
- Write a change log in Arabic and English (at least 25 characters each).
- Listings Information → Support Details → Send publication request. Publishing sends the theme to
  review; it does not go live yet.
- On submission the Portal commits to your repository, adding `repository` and `support_url` to
  `twilight.json`. Pull that commit before you push again.

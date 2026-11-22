# Forking engine components

The engine (`@salla.sa/twilight-theme-engine`) renders every page this starter does not override:
product, cart, listing, blog, account, the header and footer. You change most things without
copying any of that code:

1. **A hook slot** puts your markup at a named spot in an engine page (`app/hooks/index.tsx`).
2. **The registry** swaps one of the three components the engine resolves by name:
   `product:card`, the `home:*` blocks (`registerHomeComponents` in `app/router.tsx`) and
   `account:layout-pending`. Overriding any other name does nothing.
3. **Your own layout**: pass `layout={MyLayout}` to `TwilightProvider` in `__root.tsx` to replace
   the default header and footer.
4. **Fork a route**: copy the engine component into the theme and route to your copy.

Fork only when the first three can't do the job. A fork is code you now maintain by hand: the
engine keeps shipping fixes to its own copy, and yours doesn't get them.
See [Fork a built-in route](https://docs.salla.dev/twilight/react/recipes/fork-a-built-in-route).

## Where the source comes from

The engine package ships each component's source next to its build, as
`tailwind/<path>.tsx.txt` (for example `tailwind/routes/cart/CartPage.tsx.txt`). Packages before
1.0.86 have no source copy.

```bash
ls node_modules/@salla.sa/twilight-theme-engine/tailwind/routes
cp node_modules/@salla.sa/twilight-theme-engine/tailwind/routes/cart/CartPage.tsx.txt \
  app/components/cart/CartPage.tsx
```

Then fix the relative imports to the engine's public subpaths
(`@salla.sa/twilight-theme-engine/common`, `/cart`, `/product`, `/hooks/useStore`…; never `dist/`
or `src/`), and wire the copy in:

- **A page**: edit the route file the build generated for it in `app/routes/` (`cart.tsx`,
  `$slug.p$id.tsx`…): keep its loader, `head` and `pendingComponent`, render your component, and
  remove the `// @auto-generated` line at the top. The build deletes and regenerates files that
  carry it, and leaves the others alone. A page at a new path also needs an entry in
  `app/routes.ts` (`route('/faq', 'faq.tsx')`).
- **A home block**: register it under the block's key in `registerHomeComponents`. A block with a
  `view_style` is looked up as `key:styleN` before `key`, so register both.

## Record every fork

Keep a table in your theme (a `FORKS.md` at the root works well) with one row per fork:

| Fork (`app/components/…`) | Engine source (`tailwind/…`)  | Wired in by                 | Base    | What the fork changes |
| ------------------------- | ----------------------------- | --------------------------- | ------- | --------------------- |
| `cart/CartPage.tsx`       | `routes/cart/CartPage.tsx`    | `app/routes/cart.tsx`       | 1.0.174 | …                     |

**Base** is the engine version installed when the fork was last edited. It is the oldest upstream
change the fork might have taken in, not proof that it was synced then.

Also say at the top of the forked file's doc comment what differs from the engine, so the next
person (or you, in six months) can tell intended changes from drift.

## Upgrading the engine

For each fork, compare its engine source between **Base** and the new version, port what applies,
then set **Base** to the new version:

```bash
for v in 1.0.149 1.0.174; do
  mkdir -p engine-$v && tar -xzf "$(npm pack @salla.sa/twilight-theme-engine@$v --silent)" -C engine-$v
done
diff -u engine-1.0.149/package/tailwind/routes/cart/CartPage.tsx.txt \
  engine-1.0.174/package/tailwind/routes/cart/CartPage.tsx.txt
```

When **Base** is older than 1.0.86 (no source copy), compare the fork with the 1.0.86 source in
full. Delete the `engine-*` folders and tarballs afterwards.

A short list of forks with a known **Base** turns an engine upgrade into a few diffs. Without it,
every upgrade is a guess at what you changed and what Salla changed.

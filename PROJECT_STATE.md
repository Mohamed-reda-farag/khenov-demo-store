# PROJECT_STATE — khenov-demo-store (ATHAR)

Fictional bilingual (AR/EN) footwear store. A KHENOV portfolio demo. Static site, no backend.
Brand is invented: **ATHAR / أثر**. All data is fictional.

## Status

| Milestone                                                     | State    |
| ------------------------------------------------------------- | -------- |
| M0 Foundation                                                 | **Done** |
| M1 Home + Shop + filters + product page                       | **Done** |
| M2 Cart, checkout, orders, wishlist, search                   | Next     |
| M3 Polish (transitions, RTL/a11y audit, Lighthouse ≥ 90, 404) | —        |
| M4 Static build, hosting, README, portfolio pack              | —        |

## Done in M0

- Next.js 16 (App Router) static export, TypeScript strict, Tailwind v4, next-intl 4, Zustand 5.
- Design tokens (`src/theme/tokens.css`): colour, spacing, radius, type scale, shadow, motion, z-index.
- AR (default, RTL) / EN (LTR) routing under `/[locale]`, client-side root redirect, language switcher.
- Shell: announcement bar + "Demo by KHENOV" badge, sticky header, mega-nav, mobile menu, mini-cart
  drawer, footer with "Reset demo", toasts (with Undo), confirm dialog, skeleton/empty/error blocks.
- Demo kit (`src/lib/demo`): namespaced storage, `delay`, `simulateNetwork`, seed versioning,
  `resetDemo`, `?demo=fast|error|off`.
- Seed: 24 products, 5 categories, 3 collections, 4 banners. Repositories: catalog, cart, preferences.
- Image strategy: generated placeholders now; `npm run images:optimize` for real photos (`docs/IMAGES.md`).
- 49 unit tests (storage, demo kit, catalog queries, seed integrity, cart, i18n parity, contrast tokens).

## Done in M1

- **Home** (`src/features/home`): hero, category tiles, featured, new arrivals, promo strip + tiles, brand values,
  newsletter box in the footer (UI-only, honest success state). Each section loads on its own (skeleton, error, retry).
- **Shop** (`/shop`, `/category/[slug]`, `/collection/[slug]`, one `ShopListing`): search, filters (category, size,
  colour, price, in-stock), sort, result count, removable chips, numbered pagination (12 per page, focus moves to the
  results), URL-synced. Desktop sticky sidebar; phone bottom sheet with "Apply (N results)".
- **Product page** (`/product/[slug]`, all 24 × 2 locales prerendered): gallery + lightbox with zoom, colour swatches,
  size picker with stock states, quantity, add to cart → mini-cart with Undo, size guide, accordion, reviews with
  distribution, related, breadcrumbs, mobile sticky buy bar, per-locale metadata.
- **Cards**: hover second photo, colour dots, old price, wishlist heart (persisted), quick view.
- **Data**: stock per colour and size, sold-out scenarios, variant-aware filters and facets, fictional reviews,
  wishlist / reviews / newsletter repositories. `SEED_VERSION = 2`.
- **Tooling**: `npm run size` (initial JS per route, since Next 16 no longer prints it). 100 unit tests.

## Next

M2 — Cart page, checkout (mock), orders, wishlist page, search page. Routes still served by the "coming soon"
placeholder: `search`, `wishlist`, `account`, `cart`, `checkout`, `help/*` (`src/app/[locale]/[...slug]/page.tsx`).

## Decisions

- **Static export, client redirect at `/`:** no middleware. `/` reads the saved language, else `/ar/`.
- **Typed i18n:** `en.json` defines the message types; a test enforces identical keys + ICU arguments.
- **Numbers:** Arabic uses Arabic-Indic digits (`ar-EG`). One constant in `src/lib/format.ts` switches to Latin.
- **No animation library:** CSS transform/opacity only. Motion (LazyMotion) is added only if M3 needs it.
- **Overlays:** custom (not native `<dialog>`) so toasts with Undo stay clickable above a modal; the app
  shell goes `inert` while an overlay is open; focus is trapped and restored.
- **Images:** custom `next/image` loader maps widths to pre-built WebP (static export has no optimizer).
- **Optimistic cart:** UI updates immediately; saves are queued; a failed save rolls back and shows a toast.
- **Architecture enforced by ESLint:** UI cannot use storage or seed data directly (see `eslint.config.mjs`).
- **Shop state in the URL:** read with `useSearchParams` inside Suspense; controls use `useOptimistic` so they never lag.
- **Per-colour stock:** a product is a set of colourways; filters match a colour+size+stock combination together.
- **No JSON-LD:** structured data was left out on purpose (fictional store, nothing accurate to claim).
- **TypeScript pinned to 5.9, ESLint to 9:** TypeScript 7 and ESLint 10 are not yet supported by the tooling.

## How to run

```powershell
npm install
npm run dev          # http://localhost:3000  (redirects to /ar/)
npm run check        # format + lint + typecheck + tests
npm run build        # static export to .\out
npm run preview      # serve .\out at http://localhost:4173
```

Useful URLs: `/ar/?demo=fast` (no delays), `/en/?demo=error` (force error states), `?demo=off` (clear).

## Seed version

`SEED_VERSION = 2` in `src/lib/demo/config.ts`. Bump it whenever seed data or persisted shapes change;
every visitor is reseeded automatically and old keys are purged.

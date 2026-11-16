# PROJECT_STATE — khenov-demo-store (ATHAR)

Fictional bilingual (AR/EN) footwear store. A KHENOV portfolio demo. Static site, no backend.
Brand is invented: **ATHAR / أثر**. All data is fictional.

## Status

| Milestone                                                     | State            |
| ------------------------------------------------------------- | ---------------- |
| M0 Foundation                                                 | **Done**         |
| M1 Home + Shop + filters + product page                       | Next (not begun) |
| M2 Cart, checkout, orders, wishlist, search                   | —                |
| M3 Polish (transitions, RTL/a11y audit, Lighthouse ≥ 90, 404) | —                |
| M4 Static build, hosting, README, portfolio pack              | —                |

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

## Next

M1 — Home, Shop listing (search, filters, sort, URL-synced, pagination, skeletons), Product page.
The home page (`src/features/foundation/FoundationPreview.tsx`) is a **temporary** foundation preview
and is deleted in M1. `src/app/[locale]/[...slug]/page.tsx` serves "coming soon" for routes not built
yet; each later milestone adds a real page that overrides it.

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

`SEED_VERSION = 1` in `src/lib/demo/config.ts`. Bump it whenever seed data or persisted shapes change;
every visitor is reseeded automatically and old keys are purged.

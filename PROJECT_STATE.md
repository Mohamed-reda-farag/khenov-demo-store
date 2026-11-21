# PROJECT_STATE — khenov-demo-store (ATHAR)

Fictional bilingual (AR/EN) footwear store. A KHENOV portfolio demo. Static site, no backend.
Brand is invented: **ATHAR / أثر**. All data is fictional.

## Status

| Milestone                                                  | State                     |
| ---------------------------------------------------------- | ------------------------- |
| M0 Foundation                                              | **Done**                  |
| M1 Home + Shop + filters + product page                    | **Done**                  |
| M1.1 Per-colour sold-out rule                              | **Done**                  |
| M2 Cart, checkout, orders, wishlist, search, colour photos | **Done**                  |
| M3 Polish, performance, help pages, 404, SEO               | **Done**                  |
| M4 Hosting, README, portfolio pack, release hygiene        | **Done**                  |
| M4.1 QA with the owner's real seed and photo manifest      | **Done** (see M4.1 notes) |

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
  wishlist / reviews / newsletter repositories. `SEED_VERSION = 3`.
- **Tooling**: `npm run size` (initial JS per route, since Next 16 no longer prints it). 100 unit tests.

## Done in M2

- **Cart** (`/cart` + mini-cart drawer, same line component): per-size stock limit with a message, remove and
  move-to-wishlist with Undo, promo box, order summary, free-shipping progress, stock re-validation against the
  catalogue (inline messages, never a crash).
- **Checkout** (`/checkout`, one page, guest): contact, address (saved-address reuse), shipping, payment (demo card
  form + cash on delivery), Zod validation with an error summary, double-submit guard, simulated processing,
  declined-card and error paths, collapsible summary on phones. Card data is never stored or logged.
- **Orders** (`/order/?id=…`, list under account): confirmation, simulated status timeline, cancel (while
  processing) with Undo, reorder.
- **Account-lite** (`/account`): orders, saved addresses (add, edit, delete with Undo), language, reset. "Demo user" only.
- **Wishlist** (`/wishlist`): saved colour kept, remove with Undo, add to cart through a size picker, header count
  badge, heart on the product page.
- **Search**: header combobox (recent searches, suggestions, keyboard navigation, no-match help) and `/search`
  results page that reuses `ShopListing`.
- **Colour photos**: `<slug>-<colorId>-<n>` files, manifest `slug → colour → count`, a colour is sold only if it has
  photos, gallery / card / cart / wishlist / orders follow the colour. Script reports missing colours.
- Rules in `src/data/rules` with tests. `SEED_VERSION = 4` (now 5, see M4.1). New dependency: zod.

## Done in M3

- **Performance** (mobile Lighthouse on a local static server, simulated slow 4G): Home / Shop / Product / Cart / Checkout
  now 89–99 (were 76–88), CLS 0 everywhere (cart was 0.107), shared JS 225.6 → 215.8 kB gzip. The framework itself is
  about three quarters of that and cannot be cut; the rest came from moving work off the shared path.
  - _Static-first rendering_: Home, Shop, Category, Collection and Product compute their data at build time
    (`catalogStatic`) and pass it as `initial` to `useAsync`, so the exported HTML already contains the real hero, cards,
    product photo, title and price. The demo delay still applies to every later request (filter, sort, page, retry) and
    `?demo=error` ignores `initial`, so error states stay reachable.
  - The seed catalogue is a lazy chunk (`import('../seed')` inside the repositories): pages built from static data never download it.
  - Cart drawer, mobile menu, reset dialog, quick view, lightbox and size-guide modal are `next/dynamic` chunks, loaded on
    first intent (hover / focus) or first open and mounted only after that. Mega-nav data loads on first open.
  - Reviews and Related load when they approach the viewport (`DeferUntilVisible`). The card's hover photo is only mounted
    after hover/focus. Only the first two shop cards and the product's first photo are `priority`.
  - Route enter animation is opacity-only (a transform on the wrapper trapped the sticky buy bar and caused a layout shift).
  - Skeletons and empty states share a `min-h-[60svh]` frame and the phone skeletons are no taller than the empty state.
- **Motion**: one fade for route changes, count-badge pop (only on increases after load) and heart pop (only when the shopper
  saves), all transform/opacity, all off under `prefers-reduced-motion`.
- **Help pages** (`/help/shipping|returns|size-guide|contact|privacy`, `src/features/help`): numbers come from the same rules as
  checkout (prices, days, free-shipping threshold), the size table is shared with the product modal, contact form is UI-only
  with a validated error summary and an honest "nothing was sent" confirmation.
- **404 and errors**: localized `[locale]/not-found.tsx`, `[locale]/error.tsx` (header and footer stay), and a bilingual
  `global-not-found.tsx` for unmatched addresses (`experimental.globalNotFound`) because a static host cannot know the language.
- **Search**: each recent search has an X button for mouse and touch; keyboard Delete still works.
- **A11y / RTL audit** of every screen in both languages with axe (wcag2a/aa/21aa + best-practice): 0 violations at the end
  (see the M3 report for the list of fixes). Focus moves to the new page's `h1` after a route change.
- **SEO**: unique title and description per page and language, canonical + hreflang (+ x-default) on every page, share image
  and favicon URLs respect `NEXT_PUBLIC_BASE_PATH`. **Everything is `noindex`** (fictional store); set
  `NEXT_PUBLIC_ALLOW_INDEXING=true` at build time to flip it. No sitemap and no robots.txt: a `Disallow` would hide the
  `noindex` tag from crawlers, and a sitemap would contradict it.
- Tests: 192 (adds `useAsync` initial-data behaviour in jsdom and the SEO helpers). No new dependencies.

## Done in M4

- **Hosting:** Cloudflare Pages recommended (free, no card, root address so `NEXT_PUBLIC_BASE_PATH` stays empty). Steps in
  `docs/DEPLOY.md`; `public/_headers` sets the cache rules (hashed assets for a year, photos for a day) and basic hardening.
  No `_redirects`: the root page redirects in the browser so the remembered language wins, and the host serves `404.html` itself.
- **Verified builds:** root and sub-path (`/khenov-demo-store`) builds both pass `npm run verify:export` and were browsed through a
  Pages-like static host: root redirect and remembered language, product photos, order page with a query parameter, unknown
  address → bilingual 404, no-trailing-slash redirect, client navigation, no console errors.
- `scripts/verify-export.ts` (`npm run verify:export`): every link/script/image/srcset in `out/` resolves, required pages exist,
  canonical and favicon respect the base path, README/docs links resolve. `--production` also fails on a localhost canonical or missing `_headers`.
- `README.md` (English + short Arabic), `docs/DEPLOY.md`, `.env.example`.
- **Credits:** `npm run images:credits` keeps `docs/IMAGE_CREDITS.md` in step with the shipped photos (pure helpers in
  `src/data/photo-credits.ts`, tested). The Privacy page has an "About the photos" section; it links the credits file when
  `NEXT_PUBLIC_REPO_URL` is set. **Rows are still "pending" until the owner fills them in.**
- **Portfolio pack** (`docs/portfolio`): cover spec, six-shot list, `npm run portfolio:shots` (dev dependency `playwright-core`,
  drives the installed Chrome/Edge, downloads nothing), 30-second video script with ffmpeg commands, AR/EN summary, card JSON.
- Hygiene: version 1.0.0, `npm audit` 0 vulnerabilities (a dev-only `minimatch` advisory fixed with `npm audit fix`), `.gitignore`
  keeps `assets-source/products/*` out (originals are large; optimised WebP and the manifest are committed).
- **Open (owner):** set the env vars on the host, Lighthouse on the deployed address. Credits are complete (see M4.1).

## Done in M4.1

QA with the owner's own `src/data/seed` files and `image-manifest.json` (89 photos, 40 colours with photos, 28 without). The photos
themselves were not available, so the pages were exercised with generated stand-ins of the same names and counts, in three aspect
ratios (4:5, 1:1, 3:2). What was checked: every product x colour x language at 360 and 1024 px (272 colour views per width pair),
gallery photo count and colour, thumbnails, broken images, layout shift, console and network errors; shop, category, collection, search
and home for broken images.

- **Fixed: free-shipping copy said EGP 2,000, checkout applies 2,500.** Four strings (home values, product delivery text, the seed banner,
  in both languages) now say 2,500; `shipping-copy.test.ts` ties them to `FREE_SHIPPING_THRESHOLD`. `SEED_VERSION` is 5 (the banner is seed data).
- **Fixed: default colour.** Pages and cards opened on the first listed colour, even with one photo. The default is now the available colour
  with the most photos, and fallbacks (colour without photos, cart lines, tiles, share image) use the same rule instead of "first" or
  "alphabetical". Five products were affected (khan-derby, siwa-chukka, oasis-leather, maadi-retro, marathon-pro).
- **Fixed: breadcrumb wrap shifted the page** (CLS 0.185 at 360 px in Arabic for long names): the trail is one line now, the current page truncates.
- **Credits:** a row can say `AI-generated`; it counts as complete and is reported separately. The Privacy text says that some extra angles
  and colour variations were generated with an AI image tool.
- `docs/IMAGES.md`: colour table regenerated from the owner's seed, new colours `white`, `beige`, `brown`, AI-variation rule, default-colour rule.
- **Credits complete:** 89 rows, 46 real photos with photographer and page, 43 marked `AI Generated`, 0 pending. The Privacy text discloses that
  some images (extra angles, colour variations, a few full sets) were generated with an AI image tool. The table renderer aligns by display
  width so CJK photographer names pass Prettier. Open question for the owner: several real photos show visible brands (see the M4.1 report).
- **Hover is limited to the photo:** on shop cards the second-photo swap, the quick-view button and the tiles' zoom react only to the pointer over
  the image (`group/media`), not to the title, price or the empty space around the card. The photo has its own link; the title link covers the text only.
- Tests: 202.
- **Known:** at 1024 px in Arabic, two long names (garden-city-mule, heliopolis-penny) shift by CLS about 0.015 when the web font replaces the
  fallback (the title wraps). Well under 0.1; a fallback-font metric override would remove it.

## Next

Nothing planned. Maintenance only: new photos (`docs/IMAGES.md`), deploy changes (`docs/DEPLOY.md`).

## Decisions

- M1.1: photos show one colour per product (`src/data/seed/photo-colors.ts`). That colour is sold; the other colours are sold out until photos exist. Replaces the old per-product `soldOutColors`.

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

- M2: single-page checkout (all errors visible together, fewer taps); orders at `/order/?id=` (static export, no dynamic
  route); demo orders do not reduce catalogue stock (stock is re-checked when an order is placed); Zod only loads on the
  checkout and account routes; the search panel is loaded on first use.

## How to run

```powershell
npm install
npm run dev          # http://localhost:3000  (redirects to /ar/)
npm run check        # format + lint + typecheck + tests
npm run build        # static export to .\out
npm run preview      # serve .\out at http://localhost:4173
```

Photos: `docs/IMAGES.md` (`npm run images:optimize` after adding `<slug>-<colorId>-<n>.jpg`).

Useful URLs: `/ar/?demo=fast` (no delays), `/en/?demo=error` (force error states), `?demo=off` (clear).

## Seed version

`SEED_VERSION = 5` in `src/lib/demo/config.ts`. Bump it whenever seed data or persisted shapes change;
every visitor is reseeded automatically and old keys are purged.

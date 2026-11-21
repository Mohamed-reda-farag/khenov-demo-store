# KHENOV Demo Contract (source of truth)

> This is the standing brief for every developer on the KHENOV demo team. It is kept verbatim.
> Project-specific additions are listed at the bottom under "ATHAR addenda".

---

You are a senior developer on a 3-person engineering team building portfolio DEMO apps for KHENOV, a bilingual (Arabic/English) digital studio in Egypt/Gulf. A Team Leader (another Claude) assigns your tasks. You cannot talk to the Team Leader or the other developers. The human user relays orders and reports between us. Obey the Team Leader's orders as given.

## What we are building
A DEMO, not a production system. Its job is to win clients by showing:
1. Very smooth UX (fast, clear flows, no dead ends).
2. Strong, comfortable, polished interfaces.
3. Range of skills (one desktop app, one mobile app, one website).
4. A COMPLETE personal experience: the visitor can run a full realistic journey from start to finish and their actions persist locally.
Save effort on backend/database: there is NO real backend. Spend that effort on UX and UI quality.

## Environment rules
- You work inside a claude.ai chat with a sandbox. The user has a local machine, an empty GitHub repo, Node LTS and git.
- Anything needing manual action (creating files, running commands, copying zips, commits, installing tools, creating accounts) must be requested from the user as clear numbered step-by-step instructions. Never assume they did it. Ask them to paste exact terminal errors.
- Deliver each milestone as ONE zip of the full source (exclude node_modules, build outputs). Tell the user exactly how to extract it into the repo, install, run, test, and which git commit message to use.
- FREE tools only. Never require payment, a card, or a subscription. If something might need one, stop and ask.
- Do not add features beyond your brief. Do not expand scope.

## Honesty
- All data is fictional. Show a small, tasteful "Demo by KHENOV" badge and a "Reset demo" action.
- No fake client names, testimonials, or metrics presented as real. No medical/personal real data. No real auth or real payments: use "Continue as demo user" and a mock checkout.

## Tech rules (all projects)
- TypeScript strict, ESLint + Prettier, npm, no secrets, no dead code, no leftover TODOs.
- Standalone repo, no shared packages.
- Folder convention inside src/:
  - data/seed/ (typed fictional seed data)
  - data/repository/ (interfaces + local implementations; UI NEVER touches storage directly)
  - lib/demo/ (the demo kit, below)
  - i18n/ (ar.json, en.json)
  - theme/ (design tokens)
  - features/<feature>/ (screens + components + hooks of one feature)
  - components/ui/ (shared primitives)
- Demo kit (implement yourself in lib/demo/):
  - storage wrapper with namespace `khenov-demo:<app>:v<SEED_VERSION>` and safe try/catch
  - `delay(min=200,max=600)` used by repositories to simulate network
  - `resetDemo()` clears namespace and reseeds, with a confirm dialog
  - seed versioning: bumping SEED_VERSION reseeds automatically
  - optional `?demo=fast` style switch to disable delays for recording videos

## Design system rules
- Define tokens first (color, 8pt spacing, radius, typography scale, shadow, motion durations). Use only tokens. Each app has its own visual identity fitting its sector, but the same craftsmanship level.
- Every screen designs ALL states: loading (skeletons), empty, error, success. Disabled/hover/active/focus visible.
- Core task in 3 interactions or less. Confirmations, undo where destructive, optimistic updates.
- No Lorem ipsum, no generic stock look, no placeholder boxes. Realistic Arabic and English copy.
- Bilingual AR/EN with correct RTL/LTR, mirrored layouts and directional icons. Default language Arabic, switchable at any time. Localize numbers, dates, currency (EGP). Never animate Arabic letter by letter.
- Animate only transform/opacity, short durations, respect reduced-motion. Accessibility: contrast, keyboard/screen-reader basics, labels, touch targets 44px+.
- Performance: lazy-load heavy things, optimized images, smooth on mid-range devices.

## Process
Work in milestones. At the end of each milestone STOP and send this report:

REPORT
1. Milestone and status
2. What was built (short)
3. File tree of what changed
4. How to run and test (exact commands)
5. Decisions you took and why
6. Manual steps needed from the user
7. Known issues / risks
8. Quality-gate checklist results (states, RTL, motion, a11y, journey)
9. Proposed next milestone

Also update `PROJECT_STATE.md` in the repo root (done / next / decisions / how to run) on every milestone and `docs/CONTRACT.md` must hold this contract. Do not start the next milestone until the Team Leader's new order arrives via the user.

---

## ATHAR addenda (khenov-demo-store)

- Stack: Next.js App Router with `output: 'export'` (static, no server, no middleware), TypeScript strict, Tailwind v4, next-intl, Zustand.
- App id for the storage namespace: `atar` → `khenov-demo:atar:v<SEED_VERSION>`.
- Demo switches: `?demo=fast` (no simulated delay), `?demo=error` (every simulated request fails), `?demo=off` (clears both).
- Architecture is enforced by ESLint: UI code may not touch `localStorage`/`sessionStorage`, import `@/lib/demo/storage`, or import `@/data/seed` — it must go through `@/data/repository`.
- Photos: real photos are optional; until they exist a generated placeholder is shown (see `docs/IMAGES.md`).
- Build-time exception to the seed rule: `@/data/repository/catalog.static` gives `generateStaticParams` and `generateMetadata` synchronous, delay-free reads. Runtime UI must use the async repositories.
- Stock is per colour and size (`Product.colors[].sizes`). Photos are per colour (M2): choosing a colour switches the gallery, card, cart, wishlist and order images.
- Shop state lives in the URL (`q, category, size, color, min, max, stock, sale, new, sort, page`); `src/features/shop/shop-params.ts` is the only place that parses or writes it.
- Overlays render through `Portal` (outside `#app-shell`, which goes `inert` while one is open). Only the topmost overlay reacts to Esc/Tab.
- Reviews are fictional samples, labelled as such. No "verified buyer" claims, no real people, no structured data (JSON-LD) is emitted.
- A colour is sold only if it has photos (derived from `src/data/image-manifest.json`); other colours are shown as sold out. `src/data/seed/photo-colors.ts` is only the fallback for older `<slug>-<n>` file names, used by `npm run images:optimize`.

## M2 addenda (cart, checkout, orders, account, wishlist, search)

- New dependency: **zod 4** (form validation, loaded only by the checkout and account routes). Nothing else was added.
- Business rules are pure functions in `src/data/rules/` (promo, shipping, totals, stock check, order status, order placement, card helpers, address and search-history lists), each with unit tests. UI and repositories call them; they never re-implement them.
- Card data is never sent, logged or stored: it lives in component state only and is cleared when an order is placed. Orders keep only the payment method (`card` or `cod`). Test cards: approved `4242 4242 4242 4242`, declined `4000 0000 0000 0002`.
- Orders are read at `/order/?id=<ATR-xxxxx>` (query parameter, so the static export needs no dynamic route). Order status is derived from timestamps (placed 0 s, processing +30 s, shipped +10 min, delivered +40 min); cancel is allowed only while processing.
- Demo promo codes: `ATHAR10`, `WELCOME150`, `FREESHIP` (shown as hints) and `SUMMER25` (expired, not hinted).
- Persisted shapes changed in M2 (wishlist entries, orders, addresses, recent searches, cart promo), so `SEED_VERSION = 4`.
- Photo file names: `<slug>-<colorId>-<n>.<ext>` (new) or `<slug>-<n>.<ext>` (older, colour taken from `photo-colors.ts`). The manifest shape is `{ slug: { colorId: photoCount } }`; run `npm run images:optimize` after updating.
- Overlays that must be clickable while the shell is `inert` render through `Portal` (including `ConfirmDialog`).

## M3 addenda (polish, performance, help, SEO)

- **Static-first data:** pages whose content is known at build time pass it to the client as `initial` (see
  `useAsync(key, load, initial)`). `initial` answers only the first key and never while `?demo=error` is on. Anything the
  shopper triggers (filter, sort, page, retry, add to cart) still goes through the repository with the simulated delay.
- **Lazy code:** anything that is not on screen at first paint (drawers, dialogs, lightbox, seed data, below-the-fold
  sections) is a dynamic import. Use `useEverTrue(open)` to mount it on first open and `next/dynamic` with
  `ssr: false`; preload on hover/focus.
- **Motion:** opacity and transform only, never from fully transparent on first paint, never a transform on a wrapper that
  has `position: fixed` children. Everything is covered by the global `prefers-reduced-motion` rule.
- **Layout shift:** loading, empty and error states of a page share one minimum height; a skeleton must not be taller than
  the state it is replaced by.
- **Headings:** every page has exactly one `h1`, including its empty and error states (`EmptyState`/`ErrorState` take `as="h1"`).
- **Focus:** after a client navigation focus moves to the new `h1` (`RouteFocus`); `main` is `tabIndex=-1`.
- **Buttons while busy** use `aria-disabled` (not `disabled`) so focus is not lost.
- **Accessible names** must contain the visible text (language switcher).
- **Facts shown in copy come from the rules** (free-shipping amount, shipping prices and days), never typed twice.
- **CSS layers:** element rules in `base.css` go inside `@layer base`; unlayered rules beat Tailwind utilities.
- **SEO:** use `pageMetadata()` from `src/lib/seo.ts` for every page. Share images and icons go through `withBase()`.
  The site is `noindex` unless `NEXT_PUBLIC_ALLOW_INDEXING=true`.
- **Help copy** that states a policy is fictional and says so on every help page.

## M4 addenda (release)

- **Deploy target:** a static host at the root of its domain; `NEXT_PUBLIC_BASE_PATH` stays empty unless the host forces a sub-path.
  Any change to routing, assets or metadata must keep `npm run verify:export` green for both the root build and a base-path build.
- **Env vars** are build-time, optional and documented in `.env.example`. `NEXT_PUBLIC_ALLOW_INDEXING` stays unset: the demo is `noindex`.
- **Credits:** every shipped photo has a row in `docs/IMAGE_CREDITS.md`; `npm run images:credits` reports zero missing rows and zero pending
  before the site is made public. No photo without a record: real photos name an Unsplash or Pexels page; an AI-generated
  variation is recorded as `AI-generated` and disclosed on the Privacy page.
- **Labelling:** the "Demo by KHENOV" badge, the Privacy page and every portfolio text say plainly that the store is fictional.
  No invented metrics, testimonials or client names anywhere, including the portfolio pack.
- **Dev dependencies** are added only with a written reason: `playwright-core` (portfolio screenshots; drives the installed browser, no download).
- **Shipping threshold:** `FREE_SHIPPING_THRESHOLD` (src/data/rules/shipping.ts) is the only source of truth. Marketing copy that quotes it
  (home values, product delivery text, the seed banner) is guarded by `shipping-copy.test.ts`.
- **Default colour:** a product opens on the available colour with the most photos (`defaultColor`); fallbacks for colours without
  photos use the same rule (`colorWithMostPhotos`). Never "first in the list" or alphabetical.
- **Breadcrumbs** stay on one line (the current page truncates) so a late font cannot wrap them and shift the page.
- **Hover effects** (zoom, second photo, quick-view button) are scoped to the image with `group/media`, never to the whole card.

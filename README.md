# ATHAR · أثر — a fictional footwear store (demo by KHENOV)

ATHAR is a **fictional** bilingual (Arabic default, right-to-left / English) footwear e-commerce **demo** made by
KHENOV for its portfolio. It shows how a fast, accessible, modern shop can feel, from browsing to a
finished (simulated) order. There is **no company, no stock, no backend, no real payment and no real account**: products,
prices, reviews and orders are invented, and everything the shopper does is saved only in their own browser.
The "Demo by KHENOV" badge is on every page on purpose.

> Status: demo. Nothing here is a claim about a real client or real sales.

## The demo journey (about two minutes)

1. **Home**: hero banner, category tiles, featured and new products. Switch language with the button in the header (Arabic ↔ English).
2. **Shop**: filter by size, colour, price and category, sort, and page through. Hover or focus a card for a second photo, press the eye icon for a quick view.
3. **Product**: gallery with zoom, colour swatches (a colour is for sale only if it has photos), size picker with stock hints, size guide, reviews (sample reviews, labelled as such).
4. **Cart**: the drawer opens on add. Change quantity, apply a promo code, see shipping and the free-shipping threshold.
5. **Checkout**: contact, address, delivery method, payment (cash on delivery or a simulated card). Errors are listed in a summary and next to each field.
6. **Order**: a timeline that moves by itself within a few minutes (placed → processing → shipped → delivered). Cancel it while it is being prepared.
7. **Account, wishlist, search**: saved addresses and order history, a wishlist, and a search with recent searches.
8. **Help pages** and a localized **404**: shipping, returns, size guide, contact & FAQ (UI only), privacy & demo notice.

The footer's **Reset demo** clears everything the demo saved and returns the store to its starting state.

## Run it

Requirements: Node.js 22 or newer and npm.

```bash
npm ci            # install exactly what package-lock.json says
npm run dev       # http://localhost:3000  (redirects to /ar/)
npm run check     # format, lint, types and tests (must stay green)
npm run build     # static export into out/
npm run preview   # serve out/ at http://localhost:4173
```

| Script                    | What it does                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm run size`            | Per-route and shared JavaScript size (gzip) of the last build.                                             |
| `npm run verify:export`   | Checks `out/`: every link, script and image exists, 404 page, root redirect, metadata, README links.       |
| `npm run images:optimize` | Turns the photos in `assets-source/products` into WebP files and rebuilds the manifest.                    |
| `npm run images:credits`  | Reports (or `-- --write` updates) docs/IMAGE_CREDITS.md so every photo has a row.                          |
| `npm run portfolio:shots` | Takes the portfolio screenshots and cover at fixed sizes (see [docs/portfolio](docs/portfolio/README.md)). |

Build-time settings are optional environment variables, listed in [.env.example](.env.example):
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_BASE_PATH`, `NEXT_PUBLIC_ALLOW_INDEXING`, `NEXT_PUBLIC_REPO_URL`.

## Demo tools

Add these to any address:

| Flag          | Effect                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------- |
| `?demo=fast`  | No simulated network delay. Use it when recording a video.                                    |
| `?demo=error` | Every simulated request fails, so you can see each screen's error state and its retry button. |
| `?demo=off`   | Clears the two flags above. Flags can be combined: `?demo=fast,error`.                        |

**Test cards** (nothing is ever charged): `4242 4242 4242 4242` is approved, `4000 0000 0000 0002` is declined.
Any future expiry date and any three-digit security code work.

**Promo codes:** `ATHAR10` (10% off), `WELCOME150` (EGP 150 off orders of EGP 1,000 or more), `FREESHIP` (free shipping).
`SUMMER25` is expired on purpose, to show that state.

## Adding product photos and colours

Real photos come from Unsplash or Pexels only (AI-generated variations are allowed if they are recorded as such), are saved as `assets-source/products/<slug>-<colorId>-<n>.jpg`, and are
optimised with `npm run images:optimize`. A colour is shown as available only if it has at least one photo.
The rules, the list of colours per product and the exact commands are in [docs/IMAGES.md](docs/IMAGES.md).
Credits live in [docs/IMAGE_CREDITS.md](docs/IMAGE_CREDITS.md): fill in every row before going public.

## How it is built

- **Next.js 16 (App Router), static export**: `output: 'export'` with trailing slashes. Pages are pre-rendered; there is no server.
- **No backend, by design.** The UI never touches storage or seed data directly. It talks to **repository interfaces**
  (`src/data/repository`): catalogue, cart, orders, reviews, wishlist, newsletter. Today they read a seeded catalogue
  (`src/data/seed`, fictional) and keep the shopper's data in `localStorage` under `khenov-demo:atar:v<SEED_VERSION>`.
  Swapping them for real API clients would not change a single screen.
- **Demo kit** (`src/lib/demo`): simulated delay, `?demo=` flags, reset. It is the only place that fakes the network.
- **Business rules are pure functions** (`src/data/rules`): pricing, promo codes, shipping, order status, validation. They are unit-tested and also drive the copy on the help pages, so a price is never written twice.
- **Static-first rendering**: Home, Shop, Category, Collection and Product pages compute their data at build time and ship it in the HTML,
  so the first paint already contains the real photo, title and price. Later requests (filters, sorting, retry) go through the repositories with the simulated delay.
- **i18n** with next-intl: Arabic (default, RTL, Arabic plurals and digits, EGP formatting) and English. A test keeps both message files in step.
- **Design tokens only** (Tailwind v4): no hard-coded colours or spacing in components.
- **State**: Zustand for cart and wishlist; form validation with Zod on the checkout and account routes only.
- Folder map: `src/app` routes · `src/features/<feature>` screens and their logic · `src/components/ui` shared primitives · `src/data` seed, repositories, rules · `src/lib` helpers and the demo kit · `src/i18n` messages · `src/theme` tokens.
- Decisions and rules for contributors: [docs/CONTRACT.md](docs/CONTRACT.md). Current state: [PROJECT_STATE.md](PROJECT_STATE.md).

## Accessibility and performance

- Keyboard-only use works everywhere; skip link, one `h1` per page, focus moves to the new page's heading after navigation, live regions for results and errors, 44 px touch targets, state is never shown by colour alone, and all motion is transform/opacity and switches off under `prefers-reduced-motion`.
- Every page and both languages were checked with axe (WCAG 2.1 A/AA and best-practice rules) with no violations, and at 360, 390, 768, 1024 and 1440 px with no horizontal scrolling.
- Lighthouse (mobile, simulated slow 4G, local static server): Performance 89–99, Accessibility 100, Best Practices 100, layout shift 0 on Home, Shop, Product, Cart and Checkout. Lab numbers vary by machine and host; measure the deployed address yourself.
- The shared JavaScript is about 216 kB gzip, three quarters of which is the framework itself. Drawers, dialogs, the lightbox and the catalogue seed are loaded only when needed.
- The demo is `noindex` on purpose, because the store and its products are fictional. See [docs/DEPLOY.md](docs/DEPLOY.md) to change that.

## Deploy

Free and static. The recommended host is Cloudflare Pages (root address, no base path, no card). Step by step, the
files added for the host, and a GitHub Pages alternative: **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## Credits and licence

- **Code and design**: © KHENOV. No open-source licence has been chosen yet; add a `LICENSE` file if you want others to reuse the code.
- **Photos**: Unsplash and Pexels (free-use licences); some images (extra angles, colour variations, a few full sets) are AI-generated and labelled as such. Photographers and sources: [docs/IMAGE_CREDITS.md](docs/IMAGE_CREDITS.md).
- **Fonts**: Bricolage Grotesque and Readex Pro through Fontsource (SIL Open Font License). **Icons**: Lucide (ISC licence).
- ATHAR, its products, prices, reviews and orders are fictional. Any resemblance to a real shop is coincidental.

## Portfolio pack

Screenshots, cover image, a 30-second video script, bilingual project summary and a card JSON are in
[docs/portfolio](docs/portfolio/README.md).

---

## بالعربي (نبذة سريعة)

**أثر (ATHAR)** متجر أحذية **خيالي** ثنائي اللغة (عربي أولًا مع RTL، وإنجليزي)، صنعته **KHENOV** كعرض تجريبي (Demo) لأعمالها.
المتجر بلا شركة ولا مخزون ولا خادم ولا دفع حقيقي ولا حسابات حقيقية: المنتجات والأسعار والتقييمات والطلبات كلها مُختلقة،
وكل ما يفعله الزائر يُحفظ في متصفحه هو فقط.

- **للتشغيل:** `npm ci` ثم `npm run dev` (وهو يحوّلك إلى `/ar/`)، و`npm run check` للتأكد أن كل شيء سليم، و`npm run build` لإنتاج الموقع الثابت في مجلد `out`.
- **أدوات العرض:** أضف `?demo=fast` للاستجابة الفورية (مناسب لتسجيل الفيديو)، و`?demo=error` لرؤية حالات الخطأ في كل شاشة، و`?demo=off` للإيقاف. زر «إعادة ضبط العرض» في أسفل الصفحة يعيد المتجر لحالته الأولى.
- **بطاقات تجربة:** `4242 4242 4242 4242` (ناجحة) و`4000 0000 0000 0002` (مرفوضة). **أكواد الخصم:** `ATHAR10` و`WELCOME150` و`FREESHIP`، والكود `SUMMER25` منتهٍ عمدًا.
- **الصور:** من Unsplash وPexels، وبعض الصور (زوايا إضافية وتنويعات ألوان وبضع مجموعات كاملة) مولّدة بالذكاء الاصطناعي وموضّحة في ملف المصادر. تفاصيل الإضافة في [docs/IMAGES.md](docs/IMAGES.md) والمصادر في [docs/IMAGE_CREDITS.md](docs/IMAGE_CREDITS.md).
- **النشر:** مجاني وثابت، والمنصة الموصى بها Cloudflare Pages، والخطوات في [docs/DEPLOY.md](docs/DEPLOY.md).
- الموقع مضبوط على `noindex` عمدًا لأنه خيالي.

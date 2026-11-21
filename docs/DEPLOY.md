# Deploying ATHAR (free, static)

ATHAR is a static export: `npm run build` writes a plain folder, `out/`, that any static host can serve.
There is no server, no database and no function to run.

## Recommended host: Cloudflare Pages

| Why it fits                                                                                                  |
| ------------------------------------------------------------------------------------------------------------ |
| Free plan, **no card required**, unlimited bandwidth for static files.                                       |
| Serves the site from the **root** of a `*.pages.dev` address, so no base path is needed.                     |
| Builds straight from the GitHub repository on every push, and keeps a preview URL per branch.                |
| Understands `public/_headers` (cache rules) and serves the build's own `404.html` for every unknown address. |
| Fast global CDN, which matters most for the product photos.                                                  |

Alternatives, if you prefer them: **Netlify** (free tier, also reads `_headers`; works the same way) and
**GitHub Pages** (free, but serves a project site from `/<repo-name>/`, so you must build with a base path, see the end of this page).

> Nothing below creates an account for you. Each step that needs one says so. Cloudflare's free plan asks for an
> email address and a password only. If a page ever asks for a card, stop: you are on the wrong plan.

## Before the first deploy

1. **Photos are committed**: `public/images/products/` and `src/data/image-manifest.json` must be in the repository,
   because the host builds from it. (The originals in `assets-source/` are not committed, on purpose.)
2. **Fill in the photo credits**: run `npm run images:credits`. It must report `Credits still pending: 0`. See
   [IMAGE_CREDITS.md](IMAGE_CREDITS.md).
3. Run `npm run check`, `npm run build` and `npm run verify:export` locally. All three must pass.

## Steps on Cloudflare Pages

1. Open <https://dash.cloudflare.com/sign-up> and create a free account (email and password only). Confirm the email.
2. In the dashboard open **Workers & Pages** and choose **Create** then the **Pages** tab, then **Connect to Git**.
3. Authorise Cloudflare to read GitHub and pick the `khenov-demo-store` repository. Granting access to that one repository is enough.
4. Choose the **project name** carefully: it becomes the free address `https://<project-name>.pages.dev`.
5. Set the build:

   | Setting                | Value           |
   | ---------------------- | --------------- |
   | Production branch      | `main`          |
   | Framework preset       | `None`          |
   | Build command          | `npm run build` |
   | Build output directory | `out`           |
   | Root directory         | _(leave empty)_ |

6. Open **Environment variables** (production) and add:

   | Variable               | Value                                                                             |
   | ---------------------- | --------------------------------------------------------------------------------- |
   | `NODE_VERSION`         | `22`                                                                              |
   | `NEXT_PUBLIC_SITE_URL` | `https://<project-name>.pages.dev` (no trailing slash)                            |
   | `NEXT_PUBLIC_REPO_URL` | your GitHub repository address, e.g. `https://github.com/<you>/khenov-demo-store` |

   Leave `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_ALLOW_INDEXING` **unset**: the site lives at the root, and the demo stays `noindex`.

7. Press **Save and Deploy**. The first build takes a few minutes. When it finishes, open the address Cloudflare shows.
8. If you used a different project name than the address you typed in `NEXT_PUBLIC_SITE_URL`, fix the variable and
   press **Retry deployment**. These values are baked into the build.

From now on every `git push` to `main` redeploys the site.

## What was added for the host, and why

| File              | What it does                                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/_headers` | Caches `/_next/static/*` for a year (the file names are hashed), `/images/*` for a day with a week of stale-while-revalidate, and adds `nosniff`, a referrer policy and a permissions policy to every response.  |
| _no `_redirects`_ | Not needed. The root page (`/`) sends visitors to the language they used last, or Arabic, from the browser; a server redirect would ignore that memory. Pages serves `404.html` for unknown addresses by itself. |

No CSP header is set on purpose: the inline bootstrap scripts change on every build, so a strict policy needs per-build
hashes, which is not worth it for a demo. No `X-Frame-Options`, so the demo can be embedded in a portfolio page.

## Checking a deployment

1. Open the root address: it must land on `/ar/` (or `/en/` if you chose English before).
2. Open `/en/zzz/`: the page is the bilingual "not found" page and the browser tab shows a 404 status in DevTools.
3. Open `/en/order/?id=ATR-99999`: "We couldn't find this order" (the order page uses a query parameter).
4. Open a product and check all its photos load (DevTools > Network > Img shows no red rows).
5. View the page source and search for `noindex`: it must be there.
6. Run Lighthouse in Chrome DevTools (mobile, Navigation) on Home, Shop, Product, Cart and Checkout.

## Updating photos or content

Edit, run `npm run check`, commit, push. Cloudflare rebuilds. Photos keep their file name when replaced, so a browser can
show the old copy for up to a day; use a hard refresh while checking.

## Custom domain (optional, later)

Cloudflare Pages lets you attach your own domain in the project's **Custom domains** tab. Then update
`NEXT_PUBLIC_SITE_URL` to the new address and redeploy. Buying a domain is not free and is not required.

## Letting search engines index the site (not recommended)

The store is fictional, so every page is `noindex`. Only if you decide otherwise, set `NEXT_PUBLIC_ALLOW_INDEXING=true`,
redeploy, and re-read the Privacy page: it says plainly that the products and prices are invented.

## Alternative: GitHub Pages (project site)

A project site is served from `https://<user>.github.io/<repo-name>/`, so the build needs the base path:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = "/khenov-demo-store"
$env:NEXT_PUBLIC_SITE_URL  = "https://<user>.github.io"
npm run build
npm run verify:export -- --base=/khenov-demo-store --production
New-Item out/.nojekyll -ItemType File   # otherwise GitHub ignores the _next folder
```

Publish the `out` folder (for example with a GitHub Actions workflow using `actions/upload-pages-artifact` and
`actions/deploy-pages`). `public/_headers` is ignored there, so photos are cached with GitHub's defaults, and a missing
page shows the same `404.html`. The build with a base path is verified in the same way as the root build.

# Portfolio pack: ATHAR (demo)

Everything needed to put ATHAR in the KHENOV portfolio. Always label it **Demo**: it is a fictional store, not a client project.

| File                                       | What it is                                                          |
| ------------------------------------------ | ------------------------------------------------------------------- |
| this page                                  | Cover spec, screenshot shot list and how to take them               |
| [VIDEO.md](VIDEO.md)                       | 30-second video: script, recording on Windows, editing, compression |
| [SUMMARY.md](SUMMARY.md)                   | Project summary in Arabic and English, one-line card text, tags     |
| [portfolio-card.json](portfolio-card.json) | Suggested portfolio card data                                       |

Do the steps in this order: deploy ([../DEPLOY.md](../DEPLOY.md)) → fill the photo credits ([../IMAGE_CREDITS.md](../IMAGE_CREDITS.md)) →
screenshots and cover → video → card.

## 1. Cover image

| Property     | Value                                                                                                                                                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File         | `cover-1600x1000.webp`                                                                                                                                                                                                       |
| Size         | **1600 × 1000 px** (16:10), WebP, quality 84–88, aim for under 150 KB                                                                                                                                                        |
| Shows        | The **Arabic home page** at a 1600 × 1000 window: header with the "Demo by KHENOV" badge, the hero banner and the start of the product rail                                                                                  |
| Safe margins | Keep everything that matters inside the centre **1360 × 800** (80 px left and right, 100 px top and bottom). For a square thumbnail the centre **1000 × 1000** is what survives a crop, so the hero's subject must sit there |
| Do not       | Add text, a device frame, a fake browser bar, or any metrics. The badge already says it is a demo                                                                                                                            |

**Generate it automatically** (needs the site running; see section 2): `npm run portfolio:shots` writes it to `portfolio-media/`.

**Generate it by hand from a browser screenshot:**

1. Open the deployed home page in Chrome: `https://<your-address>/ar/?demo=fast`.
2. Press `F12`, then `Ctrl+Shift+M` (device toolbar). Choose **Responsive** and type **1600 × 1000**, zoom **100%**, device pixel ratio **1**.
3. Wait for the page to finish loading. Press the `⋮` menu in the device toolbar, then **Capture screenshot**. Chrome saves a PNG.
4. Convert to WebP: `ffmpeg -i cover.png -quality 86 cover-1600x1000.webp` (ffmpeg is installed in [VIDEO.md](VIDEO.md)), or drop the PNG into <https://squoosh.app> and choose WebP at quality 86.
5. Check the size is 1600 × 1000 and under 150 KB.

## 2. Screenshots (shot list)

Six shots, each in a fixed window so they match every time. All use `?demo=fast` so nothing is captured half-loaded, and the
default (light) theme: the demo has no dark mode. Use real photos, never the generated placeholders.

| #   | File                            | Language | Window (CSS px) | Address                                           | Before you capture                                     |
| --- | ------------------------------- | -------- | --------------- | ------------------------------------------------- | ------------------------------------------------------ |
| 1   | `01-home-ar-desktop.webp`       | Arabic   | 1440 × 900      | `/ar/?demo=fast`                                  | Nothing; let the hero load                             |
| 2   | `02-shop-ar-desktop.webp`       | Arabic   | 1440 × 900      | `/ar/shop/?demo=fast`                             | Nothing                                                |
| 3   | `03-product-en-desktop.webp`    | English  | 1440 × 900      | `/en/product/maadi-retro/?color=cobalt&demo=fast` | Nothing; the 3-photo gallery and swatches are visible  |
| 4   | `04-product-ar-mobile.webp`     | Arabic   | 390 × 844 @2x   | `/ar/product/maadi-retro/?color=cobalt&demo=fast` | Nothing                                                |
| 5   | `05-cart-drawer-ar-mobile.webp` | Arabic   | 390 × 844 @2x   | same as 4                                         | Choose a size, press "Add to cart"; the drawer shows   |
| 6   | `06-checkout-en-desktop.webp`   | English  | 1440 × 900      | `/en/checkout/?demo=fast`                         | Add one product first, so the order summary has a line |

The featured product is **Maadi Retro in cobalt**: it has three photos and three colours. If you have changed which colours have photos,
pick any product whose colour has 3 photos (`npm run images:optimize` lists them) and pass it to the script (below).

**Run the repeatable script** (it needs Chrome or Edge installed, and downloads nothing):

```powershell
npm run build
npm run preview                       # leave this window open
# in a second PowerShell window:
npm run portfolio:shots               # shoots http://localhost:4173
npm run portfolio:shots -- --url=https://<your-address>          # shoot the deployed site instead
npm run portfolio:shots -- --product=nile-low --color=white      # another product or colour
npm run portfolio:shots -- --browser=msedge                      # use Edge instead of Chrome
```

The files land in `portfolio-media/` (ignored by git). `--url` accepts the deployed address, so you can shoot the real thing after deploying.
The script uses `playwright-core` as a **dev dependency only**: it drives your installed browser, so no browser is downloaded and
nothing is added to the shipped site.

**Manual alternative** (no script): for each row open the address in Chrome, set the device toolbar (`Ctrl+Shift+M`) to the window size
in the table (device pixel ratio 2 for the phone rows), do the "before you capture" step, then `⋮` → **Capture screenshot**. Convert to WebP as in the cover steps.

Check each shot: no scrollbar showing at the right edge, no browser UI, the "Demo by KHENOV" badge visible on the desktop shots, no
cursor in the frame, and no placeholder (generated) shoe images.

## 3. What to upload

`cover-1600x1000.webp`, the six screenshots, `athar-demo.mp4` and its poster. Keep each screenshot under about 200 KB.

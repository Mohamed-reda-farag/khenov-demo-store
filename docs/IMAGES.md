# Product photos — how to add them

The site works without photos: every product shows a generated placeholder (a tinted shoe
silhouette on a studio background). Real photos replace the placeholders automatically.

## Rules

1. **Sources:** only [Unsplash](https://unsplash.com) or [Pexels](https://www.pexels.com). Both licences
   allow free commercial use without attribution. Do not use Google Images or any other site.
2. **No brands:** choose photos where no logo, swoosh, stripe pattern or wordmark is clearly visible.
3. **Shoes only:** no faces, no recognisable people. A plain or studio background looks best.
4. **Size:** at least **1600 px** on the long side. Portrait or square is best (the site crops to 4:5).
5. **Quantity:** `-1` is required for each product (24 files minimum). `-2` to `-6` are optional extra
   angles. The product page gallery shows them all; the shop card shows `-2` when you hover it.
6. The shoe colour does not have to match the fictional colour exactly; closer is nicer.

## Naming and placement

Save each file in `assets-source\products\` (inside the repo folder) named:

```
<product-slug>-<number>.jpg
```

Example: `assets-source\products\nile-low-1.jpg`, `assets-source\products\nile-low-2.jpg`.
`.jpg`, `.jpeg`, `.png` and `.webp` are accepted. Numbers must be 1, 2, 3… with no gaps.

## What to search for

| File (use `-1`, `-2`…) | Search on Unsplash / Pexels | Look for                      |
| ---------------------- | --------------------------- | ----------------------------- |
| `nile-low-1`           | `white leather sneaker`     | plain white low-top           |
| `dune-court-1`         | `beige suede sneaker`       | sand / tan court sneaker      |
| `corniche-hi-1`        | `black high top sneakers`   | black, high ankle             |
| `souk-canvas-1`        | `navy canvas sneakers`      | canvas, navy or earthy colour |
| `oasis-leather-1`      | `premium leather sneakers`  | clean white or olive leather  |
| `maadi-retro-1`        | `retro sneakers`            | vintage look, warm colours    |
| `sprint-delta-1`       | `black running shoes`       | sleek runner                  |
| `cairo-tempo-1`        | `grey running shoes`        | everyday trainer              |
| `nile-trail-1`         | `trail running shoes`       | olive / dark, lugged sole     |
| `pace-light-1`         | `white running shoes`       | light runner                  |
| `marathon-pro-1`       | `racing running shoes`      | thick sole, black             |
| `siwa-chukka-1`        | `suede chukka boots`        | tan suede ankle boot          |
| `atlas-chelsea-1`      | `black chelsea boots`       | leather, elastic side         |
| `sinai-hiker-1`        | `hiking boots`              | olive / brown hiking boot     |
| `alex-work-1`          | `brown leather work boots`  | rugged work boot              |
| `sahel-slide-1`        | `slide sandals`             | foam slide, beach look        |
| `dahab-strap-1`        | `strap sandals`             | adjustable straps             |
| `luxor-leather-1`      | `leather sandals`           | tan leather sandal            |
| `marsa-cork-1`         | `cork sandals`              | cork footbed                  |
| `zamalek-loafer-1`     | `black leather loafers`     | classic loafer                |
| `khan-derby-1`         | `derby shoes leather`       | open-lacing dress shoe        |
| `giza-oxford-1`        | `black oxford shoes`        | polished formal shoe          |
| `heliopolis-penny-1`   | `penny loafers`             | tan / navy loafer with strap  |
| `garden-city-mule-1`   | `leather mule shoes`        | backless leather mule         |

Tip: search, press **Download** (choose the largest size), then rename the file.

## Process the photos (PowerShell, from the repo folder)

```powershell
npm run images:optimize
```

The script reads `assets-source\products`, writes optimized WebP files (480 / 960 / 1600 px wide) to
`public\images\products\<slug>\`, and updates `src\data\image-manifest.json`. It prints which
products still use placeholders and warns about badly named or low-resolution files.

Then check the result with `npm run dev`, and commit `public\images` and `src\data\image-manifest.json`
(the raw files in `assets-source` are intentionally not committed).

## Credits

Keep a record in `docs/IMAGE_CREDITS.md` (filename, photographer, link); the file already lists every expected filename. It is not legally required
by either licence, but it is good practice and makes the portfolio pack easier to write.

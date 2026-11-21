# Product photos — how to add them

The site works without photos: every product shows a generated placeholder (a tinted shoe
silhouette on a studio background). Real photos replace the placeholders automatically.

## Rules

1. **Sources:** real photos only from [Unsplash](https://unsplash.com) or [Pexels](https://www.pexels.com). Both licences
   allow free commercial use without attribution. Do not use Google Images or any other site.
   **AI-generated images** (an extra angle, the same shoe in another colour, or a whole set) are allowed when no real photo exists,
   but they must be recorded as such in `docs/IMAGE_CREDITS.md` (photographer column: `AI Generated`); the Privacy page says so.
2. **No brands:** choose photos where no logo, swoosh, stripe pattern or wordmark is clearly visible.
3. **Shoes only:** no faces, no recognisable people. A plain or studio background looks best.
4. **Size:** at least **1600 px** on the long side. Portrait or square is best (the site crops to 4:5).
5. **Quantity:** photo 1 is required for each colour you want to sell. Photos 2 to 6 are optional extra angles.
   The product page gallery shows them all; the shop card shows photo 2 when you hover it.
6. The shoe in a photo should be the colour in its file name; closer to the swatch is nicer.

## Naming and placement

Save each file in `assets-source\products\`. There are two accepted names:

| Name                           | Meaning                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| `<slug>-<colorId>-<n>.jpg`     | Photo `n` of a specific colour. **Use this for every new photo.**                      |
| `<slug>-<n>.jpg` (older style) | Photo `n` of the colour the product was photographed in (column 3 of the table below). |

`n` = 1 is the main photo, 2 is the one shown on hover in the shop, 3 and up are extra gallery photos
(up to 6). Numbers must be 1, 2, 3… with no gaps. `.jpg`, `.jpeg`, `.png` and `.webp` are accepted.

Examples: `nile-low-sand-1.jpg`, `nile-low-sand-2.jpg`, `nile-low-sand-3.jpg`.
If a colour has both styles of file, the explicit `<slug>-<colorId>-<n>` name wins.

### Colours that exist for each product

| Product slug       | Colour ids (use in the file name) | Photographed colour (older-style files) |
| ------------------ | --------------------------------- | --------------------------------------- |
| `nile-low`         | `white`, `ivory`, `sand`          | `white`                                 |
| `dune-court`       | `sand`, `black`, `ivory`          | `sand`                                  |
| `corniche-hi`      | `black`, `ivory`, `navy`          | `black`                                 |
| `souk-canvas`      | `navy`, `terracotta`, `ivory`     | `navy`                                  |
| `oasis-leather`    | `ivory`, `olive`, `black`         | `black`                                 |
| `maadi-retro`      | `terracotta`, `cobalt`, `navy`    | `cobalt`                                |
| `sprint-delta`     | `black`, `cobalt`, `ivory`        | `black`                                 |
| `cairo-tempo`      | `stone`, `terracotta`             | `stone`                                 |
| `nile-trail`       | `olive`, `black`, `navy`          | `navy`                                  |
| `pace-light`       | `ivory`, `cobalt`                 | `ivory`                                 |
| `marathon-pro`     | `black`, `terracotta`, `cobalt`   | `cobalt`                                |
| `siwa-chukka`      | `tan`, `black`, `beige`           | `beige`                                 |
| `atlas-chelsea`    | `black`, `tan`                    | `black`                                 |
| `sinai-hiker`      | `olive`, `tan`, `black`           | `black`                                 |
| `alex-work`        | `tan`, `brown`, `black`           | `brown`                                 |
| `sahel-slide`      | `sand`, `black`, `ivory`          | `black`                                 |
| `dahab-strap`      | `tan`, `cobalt`, `black`          | `black`                                 |
| `luxor-leather`    | `tan`, `black`, `olive`           | `tan`                                   |
| `marsa-cork`       | `sand`, `olive`, `beige`          | `beige`                                 |
| `zamalek-loafer`   | `black`, `tan`, `brown`           | `black`                                 |
| `khan-derby`       | `black`, `tan`, `brown`           | `brown`                                 |
| `giza-oxford`      | `black`, `tan`, `brown`           | `black`                                 |
| `heliopolis-penny` | `tan`, `black`, `brown`           | `tan`                                   |
| `garden-city-mule` | `sand`, `black`                   | `black`                                 |

Colour ids in the whole catalogue: `white`, `ivory`, `black`, `sand`, `beige`, `brown`, `olive`, `terracotta`, `navy`, `stone`, `tan`, `cobalt`. A colour id that is not in this list is reported by the script and
ignored; add it to `COLORS` in `src/data/seed/catalog-meta.ts` (id, Arabic and English name, swatch) before photographing it.
The table above is generated from `src/data/seed/products.ts`: after you change a product's colours, update it to match.

### Rule: a colour is sold only if it has photos

A product page opens on the available colour with the **most photos** (the first listed colour wins a tie), so give at least
one colour a full set of three. Colours with a single photo work, but their gallery has no thumbnails. A colour without photos
that someone selects shows the photos of the colour with the most photos, with a note saying so.

A colour with at least one photo is "Available" (stock as defined in the seed). A colour with no photo is
shown as "Sold out" until its photos are added. Picking a colour on the product page, the shop card, the
cart, the wishlist and orders switches to that colour's photos.

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
npm run images:optimize          # only new or changed photos are processed
npm run images:optimize -- --force   # rebuild everything
```

The script reads `assets-source\products`, writes WebP files (480 / 960 / 1600 px wide) to
`public\images\products\<slug>\<colorId>-<n>-<width>.webp`, and updates `src\data\image-manifest.json`
(`product → colour → number of photos`). It prints:

- the colours that now have photos, per product;
- **colours without photos** (with the exact file name to add, so they stay "Sold out");
- warnings: unknown colour ids, files that match no product, gaps in numbering, low resolution.

Then check the result with `npm run dev` and commit `public\images` and `src\data\image-manifest.json`
(the raw files in `assets-source` are intentionally not committed).

### Adding more colours later

1. Photograph the colour and save `<slug>-<colorId>-1.jpg` … `-3.jpg` in `assets-source\products\`.
2. `npm run images:optimize`; read the printed report. The new colour appears in "Colours with photos".
3. `npm run dev`, open the product and click the colour: the gallery changes. Check the shop card dots.
4. `git add .` then commit. No code change is needed.

If an old photo set is replaced, run the script with `--force` so the old WebP files are rebuilt.
Because the file layout changed in M2, run `npm run images:optimize` once after updating the project.

## Credits

Keep a record in `docs/IMAGE_CREDITS.md` (filename, photographer, link). Neither licence requires it, but it keeps the project honest
and the Privacy page points to it. For an AI-generated variation write `AI Generated` (or `AI-generated`) as the photographer (the link can be `n/a`): the
row counts as complete and is reported separately. After adding or removing photos:

```powershell
npm run images:credits               # report: photos without a row, stale rows, rows still "pending"
npm run images:credits -- --write    # add a pending row per new photo, drop rows of deleted photos
```

Filled-in rows are never touched. Fill every "pending" row (photographer and the Unsplash / Pexels page, or `AI-generated`) **before the site goes public**.

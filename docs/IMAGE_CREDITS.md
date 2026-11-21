# Image credits

One row per shipped photo, named like the file in `assets-source/products` (`<slug>-<colorId>-<n>.<ext>`).
Real photos name the photographer and the Unsplash / Pexels page they came from. Images generated with an
AI image tool (extra angles, colour variations, and the full set for a few products) say `AI Generated` and
have no link. The Privacy page discloses this.

Neither licence requires attribution, but a record keeps the project honest.

**Keeping the table in step with the photos**

```
npm run images:credits              # report: photos without a row, stale rows, rows still pending
npm run images:credits -- --write   # add a pending row for each new photo, drop rows of deleted photos
```

Rows you have already filled in are never touched. Before the site goes public no row should say `pending`.

| File                            | Photographer                | Source link                                                                                                     |
| ------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `alex-work-1.jpg`               | 丹 师                       | https://www.pexels.com/photo/stylish-brown-boots-on-retro-wooden-crate-30229961/                                |
| `alex-work-2.jpg`               | AI Generated                | None                                                                                                            |
| `alex-work-3.jpg`               | 丹 师                       | https://www.pexels.com/photo/stylish-leather-boots-on-sheepskin-rug-30229968/                                   |
| `alex-work-black-1.png`         | AI Generated                | None                                                                                                            |
| `atlas-chelsea-1.jpg`           | AI Generated                | None                                                                                                            |
| `atlas-chelsea-2.jpg`           | Adrian Maximiliano Arellano | https://unsplash.com/photos/black-leather-lace-up-boot-VQZiHsb9YTk                                              |
| `atlas-chelsea-3.jpg`           | AI Generated                | None                                                                                                            |
| `atlas-chelsea-tan-1.png`       | AI Generated                | None                                                                                                            |
| `atlas-chelsea-tan-2.png`       | AI Generated                | None                                                                                                            |
| `cairo-tempo-1.jpg`             | Erik Mclean                 | https://www.pexels.com/photo/trendy-sneakers-and-box-on-wooden-table-4211340/                                   |
| `cairo-tempo-2.jpg`             | Erik Mclean                 | https://www.pexels.com/photo/modern-sneakers-with-stripe-on-surface-in-box-4211334/                             |
| `cairo-tempo-3.jpg`             | Erik Mclean                 | https://www.pexels.com/photo/faceless-person-in-stylish-sneakers-on-walkway-4228203/                            |
| `cairo-tempo-terracotta-1.png`  | AI Generated                | None                                                                                                            |
| `corniche-hi-1.png`             | Kampus Production           | https://www.pexels.com/photo/close-up-photo-of-black-sneakers-7857502/                                          |
| `corniche-hi-2.jpg`             | Atlantic Ambience           | https://www.pexels.com/photo/pair-of-sneakers-12969235/                                                         |
| `corniche-hi-3.jpg`             | Atlantic Ambience           | https://www.pexels.com/photo/sneakers-on-white-surface-12969390/                                                |
| `corniche-hi-navy-1.png`        | AI Generated                | None                                                                                                            |
| `dahab-strap-1.jpg`             | Eugenia Remark              | https://www.pexels.com/photo/black-platform-sandals-in-shoe-box-packaging-31129835/                             |
| `dahab-strap-2.jpg`             | Eugenia Remark              | https://www.pexels.com/photo/elegant-black-leather-sandals-on-display-31129841/                                 |
| `dahab-strap-3.jpg`             | Eugenia Remark              | https://www.pexels.com/photo/black-strappy-sandals-on-white-background-31129840/                                |
| `dune-court-1.jpg`              | Grailify                    | https://unsplash.com/photos/person-wearing-blue-denim-jeans-and-brown-leather-lace-up-shoes-BdA_MiOfttI         |
| `dune-court-2.jpg`              | Grailify                    | https://unsplash.com/photos/person-wearing-blue-denim-jeans-and-brown-leather-lace-up-shoe-THVptfZFwAE          |
| `dune-court-3.png`              | AI Generated                | None                                                                                                            |
| `dune-court-black-1.png`        | AI Generated                | None                                                                                                            |
| `dune-court-ivory-1.png`        | AI Generated                | None                                                                                                            |
| `garden-city-mule-1.png`        | Ron Lach                    | https://www.pexels.com/photo/elegant-female-footwear-10117809/                                                  |
| `garden-city-mule-2.jpg`        | AI Generated                | None                                                                                                            |
| `garden-city-mule-3.jpg`        | AI Generated                | None                                                                                                            |
| `giza-oxford-1.jpg`             | McFollis                    | https://unsplash.com/photos/black-dress-shoes-cologne-and-bow-tie-UoT675BS4og                                   |
| `giza-oxford-2.jpg`             | McFollis                    | https://unsplash.com/photos/black-dress-shoes-perfume-bottle-and-a-bow-tie-zUnwOAs0zfk                          |
| `giza-oxford-3.jpg`             | AI Generated                | None                                                                                                            |
| `heliopolis-penny-1.jpg`        | Noah Smith                  | https://unsplash.com/photos/brown-leather-loafers-on-blue-textile-LkuH3Txi_gs                                   |
| `heliopolis-penny-2.jpg`        | Noah Smith                  | https://unsplash.com/photos/black-leather-slip-on-shoes-QHOp95V_zqQ                                             |
| `heliopolis-penny-3.jpg`        | AI Generated                | None                                                                                                            |
| `khan-derby-1.jpg`              | Tima Miroshnichenko         | https://www.pexels.com/photo/a-close-up-shot-of-a-brown-leather-shoes-6764994/                                  |
| `khan-derby-2.jpg`              | Tima Miroshnichenko         | https://www.pexels.com/photo/brown-leather-shoes-on-a-pedestal-6764989/                                         |
| `khan-derby-3.jpg`              | AI Generated                | None                                                                                                            |
| `khan-derby-black-1.png`        | AI Generated                | None                                                                                                            |
| `luxor-leather-1.jpg`           | AI Generated                | None                                                                                                            |
| `luxor-leather-2.jpg`           | Jonathan Santiago           | https://www.pexels.com/photo/sandals-and-smartphone-on-a-stone-wall-23692992/                                   |
| `luxor-leather-3.jpg`           | AI Generated                | None                                                                                                            |
| `maadi-retro-1.jpg`             | Abdullah Alsaibaie          | https://www.pexels.com/photo/shoe-on-blue-box-18681252/                                                         |
| `maadi-retro-2.jpg`             | Abdullah Alsaibaie          | https://www.pexels.com/photo/close-up-of-blue-shoe-18681255/                                                    |
| `maadi-retro-3.jpg`             | Raul Albright               | https://www.pexels.com/photo/hand-holding-shoes-17756714/                                                       |
| `maadi-retro-navy-1.png`        | AI Generated                | None                                                                                                            |
| `maadi-retro-terracotta-1.png`  | AI Generated                | None                                                                                                            |
| `marathon-pro-1.jpg`            | AI Generated                | None                                                                                                            |
| `marathon-pro-2.jpg`            | AI Generated                | None                                                                                                            |
| `marathon-pro-3.jpg`            | AI Generated                | None                                                                                                            |
| `marathon-pro-black-1.png`      | AI Generated                | None                                                                                                            |
| `marathon-pro-terracotta-1.png` | AI Generated                | None                                                                                                            |
| `marsa-cork-1.jpg`              | DiVa 23                     | https://www.pexels.com/photo/cozy-brown-sandals-with-succulent-decor-35059665/                                  |
| `marsa-cork-2.jpg`              | Wendy Wei                   | https://www.pexels.com/photo/brown-sandals-on-sand-2950815/                                                     |
| `marsa-cork-3.jpg`              | Namfon Sasimaporn           | https://www.pexels.com/photo/relaxing-on-rocky-beach-with-sandals-37098162/                                     |
| `nile-low-1.jpg`                | Gustavo Gimenez             | https://www.pexels.com/photo/a-white-nike-air-force-shoe-9853347/                                               |
| `nile-low-2.jpg`                | Gustavo Gimenez             | https://www.pexels.com/photo/close-up-photo-of-a-nike-air-force-1-9853355/                                      |
| `nile-low-3.jpg`                | Gustavo Gimenez             | https://www.pexels.com/photo/a-close-up-shot-of-a-pair-of-shoes-8979071/                                        |
| `nile-low-sand-1.png`           | AI Generated                | None                                                                                                            |
| `nile-trail-1.jpg`              | AI Generated                | None                                                                                                            |
| `nile-trail-2.jpg`              | AI Generated                | None                                                                                                            |
| `nile-trail-3.jpg`              | AI Generated                | None                                                                                                            |
| `oasis-leather-1.png`           | Prime Cinematics            | https://www.pexels.com/photo/person-wearing-black-puma-low-top-sneakers-2057318/                                |
| `oasis-leather-2.jpg`           | AI Generated                | None                                                                                                            |
| `oasis-leather-3.png`           | AI Generated                | None                                                                                                            |
| `oasis-leather-ivory-1.png`     | AI Generated                | None                                                                                                            |
| `pace-light-1.jpg`              | Joseph Barrientos           | https://unsplash.com/photos/person-wearing-white-nike-running-shoes-standing-on-black-concrete-path-4qSb_FWhHKs |
| `pace-light-2.jpg`              | Johanna Ong                 | https://unsplash.com/photos/person-wearing-nike-low-top-sneaker-mXIEIEZDVUM                                     |
| `pace-light-3.jpg`              | AI Generated                | None                                                                                                            |
| `sahel-slide-1.jpg`             | AI Generated                | None                                                                                                            |
| `sahel-slide-2.jpg`             | Terrance Barksdale          | https://www.pexels.com/photo/pair-of-black-adidas-flip-flops-18186215/                                          |
| `sahel-slide-3.jpg`             | AI Generated                | None                                                                                                            |
| `sinai-hiker-1.jpg`             | AI Generated                | None                                                                                                            |
| `sinai-hiker-2.jpg`             | Tường Chopper               | https://www.pexels.com/photo/a-trekking-boot-on-a-rock-outside-17209441/                                        |
| `sinai-hiker-3.jpg`             | Tường Chopper               | https://www.pexels.com/photo/hand-holding-columbia-shoe-in-front-of-d-k-nong-waterfall-31650332/                |
| `siwa-chukka-1.jpg`             | 丹 师                       | https://www.pexels.com/photo/stylish-brown-boots-on-stone-steps-outdoors-30272896/                              |
| `siwa-chukka-2.jpg`             | 丹 师                       | https://www.pexels.com/photo/fashionable-street-style-with-beige-suede-boots-30272894/                          |
| `siwa-chukka-3.jpg`             | 丹 师                       | https://www.pexels.com/photo/brown-leather-boot-on-retro-car-mirror-30272889/                                   |
| `siwa-chukka-black-1.png`       | AI Generated                | None                                                                                                            |
| `siwa-chukka-tan-1.png`         | AI Generated                | None                                                                                                            |
| `souk-canvas-1.jpg`             | ALOK DAS                    | https://www.pexels.com/photo/studio-shot-of-a-pair-of-navy-blue-sports-shoes-19577864/                          |
| `souk-canvas-2.jpg`             | ALOK DAS                    | https://www.pexels.com/photo/pair-of-navy-blue-sports-shoes-and-a-wooden-box-19577866/                          |
| `souk-canvas-3.jpg`             | ALOK DAS                    | https://www.pexels.com/photo/close-up-of-sneakers-19577867/                                                     |
| `souk-canvas-terracotta-1.png`  | AI Generated                | None                                                                                                            |
| `sprint-delta-1.png`            | AI Generated                | None                                                                                                            |
| `sprint-delta-2.png`            | AI Generated                | None                                                                                                            |
| `sprint-delta-3.jpg`            | kaboompics                  | https://www.pexels.com/photo/crop-sportswoman-tying-shoelaces-on-floor-4498554/                                 |
| `zamalek-loafer-1.jpg`          | Harish Kiroriwal            | https://www.pexels.com/photo/a-person-holding-a-pair-of-black-leather-shoes-7608464/                            |
| `zamalek-loafer-2.jpg`          | Harish Kiroriwal            | https://www.pexels.com/photo/hand-holding-shoes-7608463/                                                        |
| `zamalek-loafer-3.jpg`          | AI Generated                | None                                                                                                            |

/**
 * Captures the portfolio screenshots and the cover image at fixed sizes, the same way every time.
 *
 *   npm run build && npm run preview          (leave this running in one terminal)
 *   npm run portfolio:shots                   (in a second terminal)
 *
 * Output goes to portfolio-media/ (not committed): WebP files named as in docs/portfolio/README.md.
 *
 * Options:
 *   --url=http://localhost:4173   where the site is running (use the deployed address to shoot that)
 *   --browser=chrome|msedge       an installed browser to drive (default chrome); no download needed
 *   --product=maadi-retro --color=cobalt   the product and colour to feature (needs 3 photos)
 *
 * Set CHROME_PATH to the browser executable if it is not in the usual place.
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium, type Page } from 'playwright-core';
import sharp from 'sharp';
import ar from '../src/i18n/ar.json';
import en from '../src/i18n/en.json';

const arg = (name: string, fallback: string): string =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;

const site = arg('url', 'http://localhost:4173').replace(/\/$/, '');
const browserName = arg('browser', 'chrome');
const product = arg('product', 'maadi-retro');
const color = arg('color', 'cobalt');
const outDir = path.join(process.cwd(), 'portfolio-media');
mkdirSync(outDir, { recursive: true });

const text = { ar, en };
type Locale = keyof typeof text;

/** Every page is opened with fast responses so nothing is captured half-loaded. */
const open = async (page: Page, locale: Locale, route: string, query = ''): Promise<void> => {
  const sep = query ? `${query}&` : '';
  await page.goto(`${site}/${locale}${route}?${sep}demo=fast`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
};

async function save(page: Page, name: string, quality = 84): Promise<void> {
  const png = await page.screenshot({ type: 'png' });
  const file = path.join(outDir, `${name}.webp`);
  await sharp(png).webp({ quality }).toFile(file);
  console.log(`  ${path.relative(process.cwd(), file)}`);
}

async function addToCart(page: Page, locale: Locale): Promise<void> {
  // Size radios are labelled "Size 42" / "مقاس ٤٢": match on the words before the number.
  const sizePrefix = text[locale].product.sizeOption.split('{')[0]!.trim();
  await page
    .locator(`input[aria-label^="${sizePrefix}"]:not([disabled])`)
    .first()
    .evaluate((el: HTMLElement) => el.click());
  await page.getByRole('button', { name: text[locale].product.addToCart }).first().click();
  await page.waitForTimeout(700);
}

async function main(): Promise<void> {
  const executablePath = process.env['CHROME_PATH'];
  const browser = await chromium.launch(
    executablePath ? { executablePath } : { channel: browserName },
  );

  const context = (width: number, height: number, mobile: boolean) =>
    browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: mobile ? 2 : 1,
      isMobile: mobile,
      hasTouch: mobile,
      reducedMotion: 'reduce',
    });

  console.log(`Shooting ${site} → portfolio-media/`);

  // Desktop, 1440 × 900
  {
    const ctx = await context(1440, 900, false);
    const page = await ctx.newPage();
    await open(page, 'ar', '/');
    await save(page, '01-home-ar-desktop');
    await open(page, 'ar', '/shop/');
    await save(page, '02-shop-ar-desktop');
    await open(page, 'en', `/product/${product}/`, `color=${color}`);
    await save(page, '03-product-en-desktop');
    await addToCart(page, 'en');
    await open(page, 'en', '/checkout/');
    await save(page, '06-checkout-en-desktop');
    await ctx.close();
  }

  // Phone, 390 × 844 at 2x
  {
    const ctx = await context(390, 844, true);
    const page = await ctx.newPage();
    await open(page, 'ar', `/product/${product}/`, `color=${color}`);
    await save(page, '04-product-ar-mobile');
    await addToCart(page, 'ar');
    await save(page, '05-cart-drawer-ar-mobile');
    await ctx.close();
  }

  // Cover, 1600 × 1000: the Arabic home page on a wide desktop.
  {
    const ctx = await context(1600, 1000, false);
    const page = await ctx.newPage();
    await open(page, 'ar', '/');
    await save(page, 'cover-1600x1000', 86);
    await ctx.close();
  }

  await browser.close();
  console.log('Done.');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

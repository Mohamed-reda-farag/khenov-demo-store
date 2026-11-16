/**
 * Turns the raw product photos you downloaded into optimized WebP files the site can use.
 *
 *   assets-source/products/<slug>-<n>.jpg   →   public/images/products/<slug>/<n>-{480,960,1600}.webp
 *                                               src/data/image-manifest.json
 *
 * Run:  npm run images:optimize
 * Options (for testing): --src=<dir> --out=<dir> --manifest=<file>
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { PRODUCTS } from '../src/data/seed/products';

const WIDTHS = [480, 960, 1600] as const;
const ASPECT = 4 / 5;
const QUALITY = 78;
const MIN_LONG_SIDE = 1200;
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function arg(name: string, fallback: string): string {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : fallback;
}

const root = process.cwd();
const srcDir = path.resolve(root, arg('src', 'assets-source/products'));
const outDir = path.resolve(root, arg('out', 'public/images/products'));
const manifestPath = path.resolve(root, arg('manifest', 'src/data/image-manifest.json'));

const kb = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;

async function main(): Promise<void> {
  const slugs = new Set(PRODUCTS.map((p) => p.slug));
  let files: string[];
  try {
    files = (await readdir(srcDir)).filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()));
  } catch {
    console.error(`Folder not found: ${srcDir}`);
    process.exitCode = 1;
    return;
  }

  const found = new Map<string, Map<number, string>>();
  const problems: string[] = [];

  for (const file of files.sort()) {
    const match = /^(.+)-(\d+)\.[a-z]+$/i.exec(file);
    const slug = match?.[1]?.toLowerCase();
    const index = Number(match?.[2]);
    if (!slug || !slugs.has(slug) || !Number.isInteger(index) || index < 1 || index > 6) {
      problems.push(`Ignored "${file}": the name must look like <product-slug>-<1..6>.jpg`);
      continue;
    }
    const byIndex = found.get(slug) ?? new Map<number, string>();
    if (byIndex.has(index)) {
      problems.push(
        `Ignored "${file}": ${slug}-${index} already exists as "${byIndex.get(index)}"`,
      );
      continue;
    }
    byIndex.set(index, file);
    found.set(slug, byIndex);
  }

  let totalBytes = 0;
  let totalFiles = 0;
  const manifest: Record<string, number> = {};

  for (const [slug, byIndex] of [...found.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (const [index, file] of [...byIndex.entries()].sort(([a], [b]) => a - b)) {
      const input = path.join(srcDir, file);
      const meta = await sharp(input).rotate().metadata();
      const longSide = Math.max(meta.width ?? 0, meta.height ?? 0);
      if (longSide < MIN_LONG_SIDE) {
        problems.push(
          `"${file}" is only ${longSide}px on its long side; it will look soft (aim for 1600px+).`,
        );
      }
      const folder = path.join(outDir, slug);
      await mkdir(folder, { recursive: true });
      for (const width of WIDTHS) {
        const target = path.join(folder, `${index}-${width}.webp`);
        await sharp(input)
          .rotate()
          .resize({ width, height: Math.round(width / ASPECT), fit: 'cover', position: 'centre' })
          .webp({ quality: QUALITY, effort: 5 })
          .toFile(target);
        totalBytes += (await stat(target)).size;
        totalFiles += 1;
      }
    }

    // Only a contiguous run starting at 1 counts; a gap would leave a broken gallery slot.
    let count = 0;
    while (byIndex.has(count + 1)) count += 1;
    if (count < byIndex.size) {
      problems.push(
        `${slug}: photos must be numbered 1,2,3… without gaps. Using the first ${count}.`,
      );
    }
    if (count > 0) manifest[slug] = count;
  }

  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const withPhotos = Object.keys(manifest).length;
  const missing = PRODUCTS.filter((p) => !manifest[p.slug]).map((p) => p.slug);

  console.log(`\nProducts with real photos: ${withPhotos} / ${PRODUCTS.length}`);
  console.log(
    `Wrote ${totalFiles} WebP files (${kb(totalBytes)} total) → ${path.relative(root, outDir)}`,
  );
  console.log(`Manifest → ${path.relative(root, manifestPath)}`);
  if (missing.length > 0) {
    console.log(`\nStill using placeholders (${missing.length}):\n  ${missing.join('\n  ')}`);
  }
  if (problems.length > 0) {
    console.log(`\nWarnings:\n  ${problems.join('\n  ')}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

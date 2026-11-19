/**
 * Turns the raw product photos you downloaded into optimized WebP files the site can use.
 *
 *   assets-source/products/<slug>-<colorId>-<n>.jpg   a photo of one colour (n = 1 main, 2 hover, 3 third…)
 *   assets-source/products/<slug>-<n>.jpg             legacy: the product's photographed colour
 *                                                     (src/data/seed/photo-colors.ts)
 *     →   public/images/products/<slug>/<colorId>-<n>-{480,960,1600}.webp
 *         src/data/image-manifest.json   (product → colour → number of photos)
 *
 * A colour becomes available in the shop only when it has photos.
 *
 * Run:  npm run images:optimize            (unchanged photos are skipped)
 * Options: --force  --src=<dir> --out=<dir> --manifest=<file>
 */
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  buildManifest,
  colorsWithoutPhotos,
  groupPhotos,
  type PhotoNaming,
} from '../src/data/photo-files';
import { COLORS } from '../src/data/seed/catalog-meta';
import { PHOTO_COLORS } from '../src/data/seed/photo-colors';
import { PHOTO_PRODUCTS } from '../src/data/seed/products';

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
const force = process.argv.includes('--force');
const srcDir = path.resolve(root, arg('src', 'assets-source/products'));
const outDir = path.resolve(root, arg('out', 'public/images/products'));
const manifestPath = path.resolve(root, arg('manifest', 'src/data/image-manifest.json'));

const kb = (bytes: number) => `${(bytes / 1024).toFixed(0)} KB`;

async function mtime(file: string): Promise<number | null> {
  try {
    return (await stat(file)).mtimeMs;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  let files: string[];
  try {
    files = (await readdir(srcDir)).filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase()));
  } catch {
    console.error(`Folder not found: ${srcDir}`);
    process.exitCode = 1;
    return;
  }

  const naming: PhotoNaming = {
    products: PHOTO_PRODUCTS,
    legacyColors: PHOTO_COLORS,
    knownColorIds: new Set(Object.keys(COLORS)),
  };
  const grouped = groupPhotos(files, naming);
  const built = buildManifest(grouped.groups);
  const problems = [...grouped.problems, ...built.problems];

  let totalBytes = 0;
  let written = 0;
  let skipped = 0;
  const expected = new Map<string, Set<string>>();

  for (const [slug, byColor] of [...grouped.groups.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const folder = path.join(outDir, slug);
    await mkdir(folder, { recursive: true });
    const keep = expected.get(slug) ?? new Set<string>();
    expected.set(slug, keep);

    for (const [colorId, byIndex] of byColor) {
      const usable = built.manifest[slug]?.[colorId] ?? 0;
      for (const [index, { file }] of [...byIndex.entries()].sort(([a], [b]) => a - b)) {
        if (index > usable) continue;
        const input = path.join(srcDir, file);
        const targets = WIDTHS.map((w) => ({ width: w, name: `${colorId}-${index}-${w}.webp` }));
        targets.forEach((t) => keep.add(t.name));

        const sourceTime = (await mtime(input)) ?? 0;
        const upToDate = await Promise.all(
          targets.map(async (t) => ((await mtime(path.join(folder, t.name))) ?? 0) > sourceTime),
        );
        if (!force && upToDate.every(Boolean)) {
          skipped += 1;
          continue;
        }

        const meta = await sharp(input).rotate().metadata();
        const longSide = Math.max(meta.width ?? 0, meta.height ?? 0);
        if (longSide < MIN_LONG_SIDE) {
          problems.push(
            `"${file}" is only ${longSide}px on its long side; it will look soft (aim for 1600px+).`,
          );
        }
        for (const { width, name } of targets) {
          const target = path.join(folder, name);
          await sharp(input)
            .rotate()
            .resize({ width, height: Math.round(width / ASPECT), fit: 'cover', position: 'centre' })
            .webp({ quality: QUALITY, effort: 5 })
            .toFile(target);
          totalBytes += (await stat(target)).size;
          written += 1;
        }
      }
    }
  }

  // Remove outputs whose source photo is gone or renamed (including the old <n>-<width>.webp layout).
  let removed = 0;
  try {
    for (const slug of await readdir(outDir)) {
      const keep = expected.get(slug) ?? new Set<string>();
      for (const name of await readdir(path.join(outDir, slug))) {
        if (name.endsWith('.webp') && !keep.has(name)) {
          await rm(path.join(outDir, slug, name));
          removed += 1;
        }
      }
    }
  } catch {
    // The output folder does not exist yet: nothing to clean.
  }

  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(built.manifest, null, 2)}\n`);

  const linked = Object.entries(built.manifest).sort(([a], [b]) => a.localeCompare(b));
  const colorCount = linked.reduce((sum, [, colors]) => sum + Object.keys(colors).length, 0);
  const missing = colorsWithoutPhotos(PHOTO_PRODUCTS, built.manifest);

  console.log(
    `\nColours with photos (available in the shop): ${colorCount}, across ${linked.length} / ${PHOTO_PRODUCTS.length} products`,
  );
  for (const [slug, colors] of linked) {
    console.log(
      `  ${slug}: ${Object.entries(colors)
        .map(([c, n]) => `${c} (${n})`)
        .join(', ')}`,
    );
  }
  console.log(
    `\nWrote ${written} WebP files (${kb(totalBytes)}), skipped ${skipped} unchanged, removed ${removed} stale → ${path.relative(root, outDir)}`,
  );
  console.log(`Manifest → ${path.relative(root, manifestPath)}`);

  if (missing.length > 0) {
    const bySlug = new Map<string, string[]>();
    missing.forEach((m) => bySlug.set(m.slug, [...(bySlug.get(m.slug) ?? []), m.colorId]));
    console.log(`\nColours without photos (shown as sold out): ${missing.length}`);
    for (const [slug, colors] of bySlug) {
      console.log(`  ${slug}: ${colors.map((c) => `${slug}-${c}-1.jpg`).join(', ')}`);
    }
  }
  if (problems.length > 0) {
    console.log(`\nWarnings:\n  ${problems.join('\n  ')}`);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

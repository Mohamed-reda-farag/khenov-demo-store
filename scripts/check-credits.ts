/**
 * Keeps docs/IMAGE_CREDITS.md in step with the photos you actually ship.
 *
 *   npm run images:credits            report: photos without a row, stale rows, rows still "pending"
 *   npm run images:credits -- --write add a "pending" row for every new photo and drop stale rows
 *
 * The photo list comes from assets-source/products (the files you downloaded). If that folder is
 * empty on this machine, the list is rebuilt from src/data/image-manifest.json as `.jpg` names.
 * Fill in the photographer and the Unsplash / Pexels page for every "pending" row before going public.
 * A photo that is an AI-generated variation has no photographer: write `AI-generated` in that column
 * (any text after it is fine; a space instead of the hyphen works too) and it counts as complete.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  parseCredits,
  reconcileCredits,
  renderCredits,
  summarizeCredits,
} from '../src/data/photo-credits';

const root = process.cwd();
const sourceDir = path.join(root, 'assets-source', 'products');
const manifestFile = path.join(root, 'src', 'data', 'image-manifest.json');
const creditsFile = path.join(root, 'docs', 'IMAGE_CREDITS.md');
const write = process.argv.includes('--write');
const IMAGE = /\.(jpe?g|png|webp)$/i;

function shippedPhotos(): { files: string[]; origin: string } {
  const fromSource = existsSync(sourceDir)
    ? readdirSync(sourceDir).filter((f) => IMAGE.test(f))
    : [];
  if (fromSource.length > 0) return { files: fromSource, origin: 'assets-source/products' };
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf8')) as Record<
    string,
    Record<string, number>
  >;
  const files = Object.entries(manifest).flatMap(([slug, colors]) =>
    Object.entries(colors).flatMap(([color, count]) =>
      Array.from({ length: count }, (_, i) => `${slug}-${color}-${i + 1}.jpg`),
    ),
  );
  return { files, origin: 'src/data/image-manifest.json' };
}

const { files, origin } = shippedPhotos();
const parsed = parseCredits(readFileSync(creditsFile, 'utf8'));
const result = reconcileCredits(files, parsed.rows);
const summary = summarizeCredits(result.rows);

console.log(
  `Photos found (${origin}): ${files.length}. Rows in the credits file: ${parsed.rows.length}.`,
);
if (result.added.length > 0)
  console.log(`Photos without a row (${result.added.length}):\n  ${result.added.join('\n  ')}`);
if (result.removed.length > 0)
  console.log(
    `Rows for photos that no longer exist (${result.removed.length}):\n  ${result.removed.join('\n  ')}`,
  );
if (summary.unexpectedLinks.length > 0) {
  console.log(
    `Links that are not Unsplash or Pexels (${summary.unexpectedLinks.length}):\n  ${summary.unexpectedLinks.join('\n  ')}`,
  );
}
console.log(
  `AI-generated: ${summary.generated}. Credits still pending: ${summary.pending} of ${summary.total}.`,
);

if (write) {
  writeFileSync(creditsFile, renderCredits(parsed.intro, result.rows));
  console.log('docs/IMAGE_CREDITS.md updated.');
} else if (result.added.length > 0 || result.removed.length > 0) {
  console.log('Run `npm run images:credits -- --write` to bring the table up to date.');
  process.exitCode = 1;
}

/**
 * Prints the initial JavaScript each route loads (gzip), read from the static export in ./out.
 * `next build` no longer prints per-route sizes, so this fills the gap.
 *
 * Run after `npm run build`:  npm run size
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const out = path.resolve(process.cwd(), 'out');
const sizeCache = new Map<string, number>();

async function gzipSize(file: string): Promise<number> {
  const cached = sizeCache.get(file);
  if (cached !== undefined) return cached;
  const size = gzipSync(await readFile(file)).length;
  sizeCache.set(file, size);
  return size;
}

async function* htmlFiles(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== '_next') yield* htmlFiles(full);
    } else if (entry.name === 'index.html') {
      yield full;
    }
  }
}

const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} kB`;

/** Collapses /ar/product/<slug>/ and /en/product/<slug>/ into one row per route pattern. */
function pattern(route: string): string {
  return route
    .replace(/^\/(ar|en)/, '/[locale]')
    .replace(/^(\/\[locale\]\/(?:product|category|collection))\/[^/]+/, '$1/[slug]');
}

async function main(): Promise<void> {
  try {
    await stat(out);
  } catch {
    console.error('No ./out folder. Run "npm run build" first.');
    process.exitCode = 1;
    return;
  }

  const rows = new Map<string, { html: number; js: number; shared: number }>();
  const shared = new Set<string>();
  const perRoute: { route: string; scripts: string[]; html: number }[] = [];

  for await (const file of htmlFiles(out)) {
    const html = await readFile(file, 'utf8');
    const route = `/${path.relative(out, path.dirname(file)).split(path.sep).join('/')}`.replace(
      /\/\.$/,
      '/',
    );
    const scripts = [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.js)"/g)].map(
      (m) => m[1] ?? '',
    );
    perRoute.push({ route, scripts: [...new Set(scripts)], html: gzipSync(html).length });
  }

  // Scripts that every page loads are the "shared" baseline (error pages are not pages).
  const pages = perRoute.filter((r) => /^\/(ar|en)(\/|$)/.test(r.route));
  const counts = new Map<string, number>();
  pages.forEach((r) => r.scripts.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1)));
  counts.forEach((n, s) => {
    if (n === pages.length) shared.add(s);
  });

  let sharedBytes = 0;
  for (const s of shared) sharedBytes += await gzipSize(path.join(out, s));

  for (const { route, scripts, html } of perRoute) {
    if (!/^\/(ar|en)(\/|$)/.test(route)) continue;
    const key = pattern(route);
    let own = 0;
    for (const s of scripts) if (!shared.has(s)) own += await gzipSize(path.join(out, s));
    const prev = rows.get(key);
    rows.set(key, {
      html: Math.max(prev?.html ?? 0, html),
      js: Math.max(prev?.js ?? 0, own),
      shared: sharedBytes,
    });
  }

  console.log(`\nShared JS loaded by every page: ${kb(sharedBytes)} (gzip)\n`);
  console.log(
    'Route'.padEnd(40) + 'Route JS'.padStart(12) + 'First load'.padStart(14) + 'HTML'.padStart(12),
  );
  for (const [key, row] of [...rows.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(
      key.padEnd(40) +
        kb(row.js).padStart(12) +
        kb(row.js + row.shared).padStart(14) +
        kb(row.html).padStart(12),
    );
  }
  console.log(
    '\nSizes are gzip. "First load" = shared + route-specific scripts referenced by the HTML.',
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

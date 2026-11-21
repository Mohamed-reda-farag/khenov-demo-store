/**
 * Checks the static build in `out/` the way a visitor's browser would, without a server.
 *
 *   npm run build && npm run verify:export
 *
 * It reads every HTML file and confirms that each local link, script, stylesheet, image and srcset
 * target exists in `out/`, that the pages the host depends on are present (404.html, the root
 * redirect, the order page, both locales of every route), and that the metadata is consistent
 * with the build settings. It also checks the relative links in README.md and docs/*.md.
 *
 * Options:
 *   --base=/sub-path   the NEXT_PUBLIC_BASE_PATH the build was made with (default: empty)
 *   --production       treat a localhost canonical address and missing _headers as errors
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'out');
const arg = (name: string): string | undefined =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const base = (arg('base') ?? process.env['NEXT_PUBLIC_BASE_PATH'] ?? '').replace(/\/$/, '');
const production = process.argv.includes('--production');

const errors: string[] = [];
const warnings: string[] = [];
const fail = (message: string) => errors.push(message);

function walk(dir: string, filter: (file: string) => boolean): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full, filter);
    return filter(full) ? [full] : [];
  });
}

/** Does `out/` contain what the browser would receive for this site-absolute path? */
function resolves(sitePath: string): boolean {
  const clean = decodeURIComponent(sitePath.split('#')[0]!.split('?')[0]!);
  if (base && clean !== base && !clean.startsWith(`${base}/`)) return false;
  const local = clean.slice(base.length) || '/';
  const target = path.join(outDir, local);
  if (!target.startsWith(outDir)) return false;
  if (existsSync(target) && statSync(target).isFile()) return true;
  return existsSync(path.join(target, 'index.html'));
}

function localReferences(source: string): string[] {
  // preconnect hints name an origin, not a file (Next emits href="/" for them).
  const html = source.replace(/<link[^>]*rel="(?:preconnect|dns-prefetch)"[^>]*>/g, '');
  const refs: string[] = [];
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) refs.push(m[1]!);
  for (const m of html.matchAll(/\s(?:srcSet|srcset|imageSrcSet|imagesrcset)="([^"]+)"/g)) {
    for (const part of m[1]!.split(',')) refs.push(part.trim().split(/\s+/)[0]!);
  }
  return refs.filter((r) => r.startsWith('/') && !r.startsWith('//'));
}

if (!existsSync(outDir)) {
  console.error('out/ not found. Run `npm run build` first.');
  process.exit(1);
}

// 1. Every page's local references resolve.
const htmlFiles = walk(outDir, (f) => f.endsWith('.html'));
const checked = new Set<string>();
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = path.relative(outDir, file).replaceAll('\\', '/');
  for (const ref of localReferences(html)) {
    const key = `${page}|${ref}`;
    if (checked.has(key)) continue;
    checked.add(key);
    if (!resolves(ref)) fail(`${page}: broken reference ${ref}`);
  }
}

// 2. Pages a host or a visitor depends on.
const required = ['index.html', '404.html'];
for (const locale of ['ar', 'en']) {
  for (const route of [
    '',
    'shop',
    'cart',
    'checkout',
    'order',
    'account',
    'wishlist',
    'search',
    'help/shipping',
    'help/returns',
    'help/size-guide',
    'help/contact',
    'help/privacy',
  ]) {
    required.push(path.posix.join(locale, route, 'index.html'));
  }
}
for (const file of required) {
  if (!existsSync(path.join(outDir, file))) fail(`missing page: ${file}`);
}

// 3. The root redirect and the 404 page.
const rootHtml = readFileSync(path.join(outDir, 'index.html'), 'utf8');
if (!rootHtml.includes('0;url=./ar/'))
  fail('index.html: no-JavaScript redirect to ./ar/ is missing');
const notFound = existsSync(path.join(outDir, '404.html'))
  ? readFileSync(path.join(outDir, '404.html'), 'utf8')
  : '';
for (const locale of ['ar', 'en']) {
  if (!notFound.includes(`href="${base}/${locale}/"`)) {
    fail(`404.html: link to ${base}/${locale}/ is missing`);
  }
}

// 4. Metadata matches the build settings.
const sample = path.join(outDir, 'en', 'shop', 'index.html');
if (existsSync(sample)) {
  const html = readFileSync(sample, 'utf8');
  const canonical = /rel="canonical" href="([^"]+)"/.exec(html)?.[1] ?? '';
  if (!canonical.endsWith(`${base}/en/shop/`)) fail(`canonical "${canonical}" lacks the base path`);
  if (canonical.includes('localhost')) {
    (production ? fail : (m: string) => warnings.push(m))(
      `canonical points at ${canonical}: set NEXT_PUBLIC_SITE_URL to the deployed address`,
    );
  }
  if (!/name="robots" content="noindex/.test(html)) {
    warnings.push('pages are not noindex (NEXT_PUBLIC_ALLOW_INDEXING=true was set at build time)');
  }
  const icon = /rel="icon" href="([^"]+)"/.exec(html)?.[1];
  if (icon !== `${base}/favicon.svg`)
    fail(`favicon link is "${icon}", expected ${base}/favicon.svg`);
}
if (!existsSync(path.join(outDir, '_headers'))) {
  (production ? fail : (m: string) => warnings.push(m))('_headers is missing from out/');
}

// 5. Relative links in the written docs.
const markdown = [
  path.join(root, 'README.md'),
  ...walk(path.join(root, 'docs'), (f) => f.endsWith('.md')),
].filter((f) => existsSync(f));
for (const file of markdown) {
  const text = readFileSync(file, 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const m of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1]!;
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), target.split('#')[0]!);
    if (!existsSync(resolved)) {
      fail(`${path.relative(root, file).replaceAll('\\', '/')}: broken link ${target}`);
    }
  }
}

const label = base ? `base path "${base}"` : 'root deployment';
console.log(
  `Checked ${htmlFiles.length} pages, ${checked.size} references and ${markdown.length} documents (${label}).`,
);
for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length > 0) {
  for (const e of errors.slice(0, 40)) console.error(`error: ${e}`);
  if (errors.length > 40) console.error(`…and ${errors.length - 40} more`);
  process.exitCode = 1;
} else {
  console.log('Static export looks consistent.');
}

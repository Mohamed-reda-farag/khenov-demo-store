/**
 * Pure rules for naming and grouping product photo files. `npm run images:optimize` uses them
 * (so the script stays a thin shell around sharp) and the unit tests cover them.
 *
 *   <slug>-<colorId>-<n>.jpg   a photo of one colour of a product (n = 1 main, 2 hover, 3 third…)
 *   <slug>-<n>.jpg             legacy: a photo of the product's photographed colour (photo-colors.ts)
 */

export const MAX_PHOTOS_PER_COLOR = 6;

export interface PhotoProduct {
  slug: string;
  colorIds: readonly string[];
}

export type PhotoFileResult =
  | { kind: 'ok'; slug: string; colorId: string; index: number; legacy: boolean }
  | { kind: 'invalid-name' }
  | { kind: 'invalid-index'; index: number }
  | { kind: 'unknown-product'; name: string }
  | { kind: 'unknown-color'; slug: string; colorId: string; knownElsewhere: boolean };

export interface PhotoNaming {
  products: readonly PhotoProduct[];
  /** Colour of the legacy `<slug>-<n>` files, per product slug. */
  legacyColors: Readonly<Record<string, string>>;
  /** Every colour id that exists anywhere in the catalogue. */
  knownColorIds: ReadonlySet<string>;
}

const stripExtension = (file: string): string => file.replace(/\.[a-z0-9]+$/i, '');

export function parsePhotoFileName(file: string, naming: PhotoNaming): PhotoFileResult {
  const match = /^(.+)-(\d+)$/.exec(stripExtension(file).toLowerCase());
  const rest = match?.[1];
  const index = Number(match?.[2]);
  if (!rest) return { kind: 'invalid-name' };
  if (!Number.isInteger(index) || index < 1 || index > MAX_PHOTOS_PER_COLOR) {
    return { kind: 'invalid-index', index };
  }

  const legacyOwner = naming.products.find((p) => p.slug === rest);
  if (legacyOwner) {
    const colorId = naming.legacyColors[legacyOwner.slug];
    return colorId && legacyOwner.colorIds.includes(colorId)
      ? { kind: 'ok', slug: legacyOwner.slug, colorId, index, legacy: true }
      : {
          kind: 'unknown-color',
          slug: legacyOwner.slug,
          colorId: colorId ?? '',
          knownElsewhere: false,
        };
  }

  const cut = rest.lastIndexOf('-');
  const slug = cut > 0 ? rest.slice(0, cut) : '';
  const colorId = cut > 0 ? rest.slice(cut + 1) : '';
  const product = naming.products.find((p) => p.slug === slug);
  if (!product) return { kind: 'unknown-product', name: rest };
  if (!product.colorIds.includes(colorId)) {
    return {
      kind: 'unknown-color',
      slug,
      colorId,
      knownElsewhere: naming.knownColorIds.has(colorId),
    };
  }
  return { kind: 'ok', slug, colorId, index, legacy: false };
}

export interface GroupedPhoto {
  file: string;
  legacy: boolean;
}

/** slug → colorId → photo number → source file. */
export type PhotoGroups = Map<string, Map<string, Map<number, GroupedPhoto>>>;

export interface GroupResult {
  groups: PhotoGroups;
  problems: string[];
}

function describeFailure(file: string, result: Exclude<PhotoFileResult, { kind: 'ok' }>): string {
  switch (result.kind) {
    case 'invalid-name':
      return `Ignored "${file}": the name must look like <product-slug>-<colorId>-<1..${MAX_PHOTOS_PER_COLOR}>.jpg`;
    case 'invalid-index':
      return `Ignored "${file}": the photo number must be between 1 and ${MAX_PHOTOS_PER_COLOR}`;
    case 'unknown-product':
      return `Ignored "${file}": no product matches "${result.name}"`;
    case 'unknown-color':
      return result.colorId === ''
        ? `Ignored "${file}": ${result.slug} has no photographed colour in photo-colors.ts`
        : result.knownElsewhere
          ? `Ignored "${file}": ${result.slug} does not offer the colour "${result.colorId}". Add it to the product in seed/products.ts first`
          : `Ignored "${file}": "${result.colorId}" is not an existing colour id (add it to COLORS in seed/catalog-meta.ts first)`;
  }
}

/**
 * Sorts files into product → colour → photo number. A name used twice keeps the explicit
 * `<slug>-<colorId>-<n>` file over a legacy `<slug>-<n>` one; two equal-kind files keep the first.
 */
export function groupPhotos(files: readonly string[], naming: PhotoNaming): GroupResult {
  const groups: PhotoGroups = new Map();
  const problems: string[] = [];

  for (const file of [...files].sort()) {
    const result = parsePhotoFileName(file, naming);
    if (result.kind !== 'ok') {
      problems.push(describeFailure(file, result));
      continue;
    }
    const byColor = groups.get(result.slug) ?? new Map<string, Map<number, GroupedPhoto>>();
    const byIndex = byColor.get(result.colorId) ?? new Map<number, GroupedPhoto>();
    const existing = byIndex.get(result.index);
    if (existing && (!existing.legacy || result.legacy)) {
      problems.push(
        `Ignored "${file}": ${result.slug}-${result.colorId}-${result.index} already comes from "${existing.file}"`,
      );
      continue;
    }
    if (existing) {
      problems.push(`Ignored "${existing.file}": "${file}" names the colour explicitly`);
    }
    byIndex.set(result.index, { file, legacy: result.legacy });
    byColor.set(result.colorId, byIndex);
    groups.set(result.slug, byColor);
  }
  return { groups, problems };
}

/** slug → colorId → number of usable photos (a contiguous run 1..n). */
export type PhotoManifestData = Record<string, Record<string, number>>;

/** Only a run that starts at 1 and has no gaps counts; a gap would leave a broken gallery slot. */
export function buildManifest(groups: PhotoGroups): {
  manifest: PhotoManifestData;
  problems: string[];
} {
  const manifest: PhotoManifestData = {};
  const problems: string[] = [];
  for (const [slug, byColor] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    for (const [colorId, byIndex] of [...byColor.entries()].sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      let count = 0;
      while (byIndex.has(count + 1)) count += 1;
      if (count < byIndex.size) {
        problems.push(
          `${slug}-${colorId}: photos must be numbered 1,2,3… without gaps. Using the first ${count}.`,
        );
      }
      if (count > 0) (manifest[slug] ??= {})[colorId] = count;
    }
  }
  return { manifest, problems };
}

/** Product colours that still have no photos (they stay sold out). */
export function colorsWithoutPhotos(
  products: readonly PhotoProduct[],
  manifest: PhotoManifestData,
): { slug: string; colorId: string }[] {
  return products.flatMap((p) =>
    p.colorIds.filter((c) => !manifest[p.slug]?.[c]).map((colorId) => ({ slug: p.slug, colorId })),
  );
}

import rawManifest from './image-manifest.json';

/** Product slug → colour id → number of real photos (1..n, contiguous). */
export type PhotoManifest = Readonly<Record<string, Readonly<Record<string, number>>>>;

/** Keeps only well-formed entries, so an old or hand-edited manifest degrades to placeholders. */
export function parseManifest(value: unknown): PhotoManifest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  const manifest: Record<string, Record<string, number>> = {};
  for (const [slug, colors] of Object.entries(value)) {
    if (typeof colors !== 'object' || colors === null || Array.isArray(colors)) continue;
    for (const [colorId, count] of Object.entries(colors)) {
      if (typeof count === 'number' && Number.isInteger(count) && count > 0) {
        (manifest[slug] ??= {})[colorId] = count;
      }
    }
  }
  return manifest;
}

/**
 * Written by `npm run images:optimize`. A colour that has no entry here has no photos,
 * which is also what makes it unavailable (see seed/products.ts).
 */
export const IMAGE_MANIFEST: PhotoManifest = parseManifest(rawManifest);

export function photoCount(
  slug: string,
  colorId: string,
  manifest: PhotoManifest = IMAGE_MANIFEST,
): number {
  return manifest[slug]?.[colorId] ?? 0;
}

export function hasPhotos(slug: string, colorId: string, manifest: PhotoManifest = IMAGE_MANIFEST) {
  return photoCount(slug, colorId, manifest) > 0;
}

/** Path without extension or width, as the image loader expects (`index` is 0-based). */
export function photoSrc(slug: string, colorId: string, index: number): string {
  return `/images/products/${slug}/${colorId}-${index + 1}`;
}

/**
 * Among `colorIds` (in order), the one with the most photos; the first wins a tie. `undefined`
 * when none has photos. A single-photo colour never outranks a full set.
 */
export function colorWithMostPhotos(
  slug: string,
  colorIds: readonly string[],
  manifest: PhotoManifest = IMAGE_MANIFEST,
): string | undefined {
  let best: string | undefined;
  let bestCount = 0;
  for (const id of colorIds) {
    const count = photoCount(slug, id, manifest);
    if (count > bestCount) {
      best = id;
      bestCount = count;
    }
  }
  return best;
}

/** The colour that has the most photos, for tiles and metadata with no colour context (ties: alphabetical). */
export function mainPhotoColorId(slug: string, manifest: PhotoManifest = IMAGE_MANIFEST) {
  return colorWithMostPhotos(slug, Object.keys(manifest[slug] ?? {}).sort(), manifest);
}

/** The colour to take a product's photo from (cart lines, orders): the chosen one, else the one with most photos. */
export function photoColorFor(
  slug: string,
  colorId: string,
  manifest: PhotoManifest = IMAGE_MANIFEST,
): string | undefined {
  return hasPhotos(slug, colorId, manifest) ? colorId : mainPhotoColorId(slug, manifest);
}

/**
 * The colour whose photos the gallery shows: the selected colour when it has photos, otherwise
 * the colour with the most photos. `undefined` means the product has no photos at all.
 */
export function galleryColorId(
  product: { slug: string; colors: readonly { id: string }[] },
  selectedColorId: string,
  manifest: PhotoManifest = IMAGE_MANIFEST,
): string | undefined {
  if (hasPhotos(product.slug, selectedColorId, manifest)) return selectedColorId;
  return colorWithMostPhotos(
    product.slug,
    product.colors.map((c) => c.id),
    manifest,
  );
}

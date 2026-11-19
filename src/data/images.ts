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

/** A colour of the product that has photos (alphabetical), for tiles that have no colour context. */
export function firstPhotoColorId(slug: string, manifest: PhotoManifest = IMAGE_MANIFEST) {
  return Object.keys(manifest[slug] ?? {}).sort()[0];
}

/** The colour to take a product's photo from (cart lines, orders): the chosen one, else any with photos. */
export function photoColorFor(
  slug: string,
  colorId: string,
  manifest: PhotoManifest = IMAGE_MANIFEST,
): string | undefined {
  return hasPhotos(slug, colorId, manifest) ? colorId : firstPhotoColorId(slug, manifest);
}

/**
 * The colour whose photos the gallery shows: the selected colour when it has photos, otherwise
 * the first colour that does. `undefined` means the product has no photos at all.
 */
export function galleryColorId(
  product: { slug: string; colors: readonly { id: string }[] },
  selectedColorId: string,
  manifest: PhotoManifest = IMAGE_MANIFEST,
): string | undefined {
  if (hasPhotos(product.slug, selectedColorId, manifest)) return selectedColorId;
  return product.colors.find((c) => hasPhotos(product.slug, c.id, manifest))?.id;
}

/**
 * Test-only fixtures (never imported by app code). The real catalogue's stock depends on which
 * photos exist (image-manifest.json), so tests build their own catalogue from a fixed manifest.
 */
import type { PhotoManifest } from './images';
import { buildProducts, PHOTO_PRODUCTS } from './seed/products';
import type { Product } from './types';

/** Every product has photos for its first colour only, like a catalogue photographed one colour at a time. */
export const TEST_MANIFEST: PhotoManifest = Object.fromEntries(
  PHOTO_PRODUCTS.map((p) => [p.slug, { [p.colorIds[0] ?? '']: 3 }]),
);

export const TEST_PRODUCTS: readonly Product[] = buildProducts(TEST_MANIFEST);

import { CATEGORIES, COLLECTIONS, PRODUCTS } from '../seed';
import type { Category, Collection, Product } from '../types';

/**
 * Synchronous, delay-free reads for build time only: `generateStaticParams` and `generateMetadata`
 * run on the server during the static export, where there is no network to simulate.
 * Runtime UI must use the async catalog repository instead.
 */
export const catalogStatic = {
  productSlugs: (): string[] => PRODUCTS.map((p) => p.slug),
  categorySlugs: (): string[] => CATEGORIES.map((c) => c.slug),
  collectionSlugs: (): string[] => COLLECTIONS.map((c) => c.slug),
  getProduct: (slug: string): Product | undefined => PRODUCTS.find((p) => p.slug === slug),
  getCategory: (slug: string): Category | undefined => CATEGORIES.find((c) => c.slug === slug),
  getCollection: (slug: string): Collection | undefined => COLLECTIONS.find((c) => c.slug === slug),
};

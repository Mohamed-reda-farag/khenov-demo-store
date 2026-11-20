import { BANNERS, CATEGORIES, COLLECTIONS, PRODUCTS } from '../seed';
import type { Banner, Category, Collection, Product } from '../types';
import type { CatalogPage, CatalogQuery } from './catalog';
import { categoryTilesFrom, featuredFrom, newArrivalsFrom, queryCatalog } from './catalog.query';

/**
 * Synchronous, delay-free reads for build time only: `generateStaticParams`, `generateMetadata`
 * and the server components that pre-render a page's first view (so the HTML already holds the
 * product photo, title and price). They run during the static export, where there is no network
 * to simulate. Anything the visitor does in the browser must use the async catalog repository.
 */
export const catalogStatic = {
  productSlugs: (): string[] => PRODUCTS.map((p) => p.slug),
  categorySlugs: (): string[] => CATEGORIES.map((c) => c.slug),
  collectionSlugs: (): string[] => COLLECTIONS.map((c) => c.slug),
  getProduct: (slug: string): Product | undefined => PRODUCTS.find((p) => p.slug === slug),
  getCategory: (slug: string): Category | undefined => CATEGORIES.find((c) => c.slug === slug),
  getCollection: (slug: string): Collection | undefined => COLLECTIONS.find((c) => c.slug === slug),
  banners: (): Banner[] => [...BANNERS],
  featured: (limit: number): Product[] => featuredFrom(PRODUCTS, limit),
  newArrivals: (limit: number): Product[] => newArrivalsFrom(PRODUCTS, limit),
  categories: (): Category[] => [...CATEGORIES],
  categoryTiles: () => categoryTilesFrom(PRODUCTS, CATEGORIES),
  list: (query: CatalogQuery): CatalogPage => queryCatalog(PRODUCTS, CATEGORIES, query),
};

import { normalizeSearch } from '@/lib/text';
import type { Category, Product } from '../types';
import type { CatalogFacets, CatalogPage, CatalogQuery, SortKey, Suggestion } from './catalog';

export const DEFAULT_PAGE_SIZE = 12;

type FacetKey = 'categories' | 'colors' | 'sizes' | 'price';

function searchHaystack(product: Product, categories: readonly Category[]): string {
  const category = categories.find((c) => c.id === product.categoryId);
  return normalizeSearch(
    [
      product.name.ar,
      product.name.en,
      product.tagline.ar,
      product.tagline.en,
      product.sku,
      category?.name.ar ?? '',
      category?.name.en ?? '',
      ...product.colors.flatMap((c) => [c.name.ar, c.name.en]),
    ].join(' '),
  );
}

function matches(
  product: Product,
  query: CatalogQuery,
  categories: readonly Category[],
  skip?: FacetKey,
): boolean {
  const text = query.q ? normalizeSearch(query.q) : '';
  if (
    text &&
    !text.split(' ').every((word) => searchHaystack(product, categories).includes(word))
  ) {
    return false;
  }
  if (query.collection && !product.collectionIds.includes(query.collection)) return false;
  if (query.onlyNew && !product.isNew) return false;
  if (query.onSale && !product.compareAtPriceEGP) return false;
  if (skip !== 'categories' && query.categories?.length) {
    if (!query.categories.includes(product.categoryId)) return false;
  }
  if (skip !== 'colors' && query.colors?.length) {
    if (!product.colors.some((c) => query.colors?.includes(c.id))) return false;
  }
  if (skip !== 'sizes' && query.sizes?.length) {
    if (!product.sizes.some((s) => s.stock > 0 && query.sizes?.includes(s.size))) return false;
  }
  if (skip !== 'price') {
    if (query.minPrice !== undefined && product.priceEGP < query.minPrice) return false;
    if (query.maxPrice !== undefined && product.priceEGP > query.maxPrice) return false;
  }
  return true;
}

const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.reviewCount - a.reviewCount,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => a.priceEGP - b.priceEGP,
  'price-desc': (a, b) => b.priceEGP - a.priceEGP,
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
};

function computeFacets(
  all: readonly Product[],
  query: CatalogQuery,
  categories: readonly Category[],
): CatalogFacets {
  const forFacet = (skip: FacetKey) => all.filter((p) => matches(p, query, categories, skip));

  const categoryCounts = new Map<string, number>();
  forFacet('categories').forEach((p) =>
    categoryCounts.set(p.categoryId, (categoryCounts.get(p.categoryId) ?? 0) + 1),
  );

  const colorCounts = new Map<string, { color: Product['colors'][number]; count: number }>();
  forFacet('colors').forEach((p) =>
    p.colors.forEach((color) => {
      const entry = colorCounts.get(color.id);
      colorCounts.set(color.id, { color, count: (entry?.count ?? 0) + 1 });
    }),
  );

  const sizeCounts = new Map<number, number>();
  forFacet('sizes').forEach((p) =>
    p.sizes.forEach((s) => {
      if (s.stock > 0) sizeCounts.set(s.size, (sizeCounts.get(s.size) ?? 0) + 1);
    }),
  );

  const prices = all.map((p) => p.priceEGP);
  return {
    categories: categories.map((c) => ({ id: c.id, count: categoryCounts.get(c.id) ?? 0 })),
    colors: [...colorCounts.values()].sort((a, b) => b.count - a.count),
    sizes: [...sizeCounts.entries()]
      .map(([size, count]) => ({ size, count }))
      .sort((a, b) => a.size - b.size),
    price: { min: Math.min(...prices), max: Math.max(...prices) },
  };
}

export function queryCatalog(
  all: readonly Product[],
  categories: readonly Category[],
  query: CatalogQuery = {},
): CatalogPage {
  const pageSize = Math.max(1, query.pageSize ?? DEFAULT_PAGE_SIZE);
  const filtered = all.filter((p) => matches(p, query, categories));
  const sorted = [...filtered].sort(sorters[query.sort ?? 'featured']);
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const page = Math.min(Math.max(1, query.page ?? 1), pageCount);
  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: sorted.length,
    page,
    pageSize,
    pageCount,
    facets: computeFacets(all, query, categories),
  };
}

export function suggestFrom(
  all: readonly Product[],
  categories: readonly Category[],
  text: string,
  limit: number,
): Suggestion[] {
  const needle = normalizeSearch(text);
  if (!needle) return [];
  const matchedCategories: Suggestion[] = categories
    .filter((c) => normalizeSearch(`${c.name.ar} ${c.name.en}`).includes(needle))
    .slice(0, 2)
    .map((category) => ({ kind: 'category', category }));
  const matchedProducts: Suggestion[] = all
    .filter((p) => normalizeSearch(`${p.name.ar} ${p.name.en}`).includes(needle))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, Math.max(0, limit - matchedCategories.length))
    .map((product) => ({ kind: 'product', product }));
  return [...matchedCategories, ...matchedProducts].slice(0, limit);
}

export function relatedTo(all: readonly Product[], source: Product, limit: number): Product[] {
  const score = (p: Product): number =>
    (p.categoryId === source.categoryId ? 10 : 0) +
    p.collectionIds.filter((c) => source.collectionIds.includes(c)).length * 3 +
    p.rating;
  return all
    .filter((p) => p.id !== source.id)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}

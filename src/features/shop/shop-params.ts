import type { CatalogQuery, SortKey } from '@/data/repository';
import { CATEGORY_IDS, type CategoryId } from '@/data/types';

/** Everything the shop remembers in the URL. Defaults are left out so URLs stay short. */
export interface ShopState {
  q: string;
  categories: CategoryId[];
  sizes: number[];
  colors: string[];
  minPrice: number | undefined;
  maxPrice: number | undefined;
  inStock: boolean;
  onSale: boolean;
  onlyNew: boolean;
  sort: SortKey;
  page: number;
}

/** Set by the route (/category/x, /collection/y): fixed, not part of the query string. */
export type ShopScope =
  { kind: 'all' } | { kind: 'category'; id: CategoryId } | { kind: 'collection'; id: string };

export const PAGE_SIZE = 12;
export const SORT_KEYS: readonly SortKey[] = [
  'featured',
  'newest',
  'price-asc',
  'price-desc',
  'rating',
];
export const DEFAULT_SORT: SortKey = 'featured';

export const EMPTY_SHOP_STATE: ShopState = {
  q: '',
  categories: [],
  sizes: [],
  colors: [],
  minPrice: undefined,
  maxPrice: undefined,
  inStock: false,
  onSale: false,
  onlyNew: false,
  sort: DEFAULT_SORT,
  page: 1,
};

interface ParamSource {
  get(name: string): string | null;
}

const list = (value: string | null): string[] =>
  value
    ? [
        ...new Set(
          value
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean),
        ),
      ]
    : [];

function whole(value: string | null, min: number, max: number): number | undefined {
  if (value === null || !/^\d{1,6}$/.test(value)) return undefined;
  const n = Number(value);
  return n >= min && n <= max ? n : undefined;
}

/** Reads and validates the query string. Anything malformed is ignored, never thrown. */
export function parseShopParams(params: ParamSource): ShopState {
  const categories = list(params.get('category')).filter((c): c is CategoryId =>
    (CATEGORY_IDS as readonly string[]).includes(c),
  );
  const sizes = list(params.get('size'))
    .map((s) => whole(s, 30, 50))
    .filter((s): s is number => s !== undefined)
    .sort((a, b) => a - b);
  const colors = list(params.get('color'))
    .filter((c) => /^[a-z][a-z-]{0,23}$/.test(c))
    .sort();
  const minPrice = whole(params.get('min'), 0, 100000);
  let maxPrice = whole(params.get('max'), 0, 100000);
  if (minPrice !== undefined && maxPrice !== undefined && maxPrice < minPrice) maxPrice = undefined;
  const sort = SORT_KEYS.find((k) => k === params.get('sort')) ?? DEFAULT_SORT;

  return {
    q: (params.get('q') ?? '').slice(0, 80).trim(),
    categories: CATEGORY_IDS.filter((c) => categories.includes(c)),
    sizes: [...new Set(sizes)],
    colors: [...new Set(colors)],
    minPrice,
    maxPrice,
    inStock: params.get('stock') === '1',
    onSale: params.get('sale') === '1',
    onlyNew: params.get('new') === '1',
    sort,
    page: whole(params.get('page'), 1, 999) ?? 1,
  };
}

/** Query string without the leading "?". Empty when everything is at its default. */
export function serializeShopParams(state: ShopState, scope: ShopScope = { kind: 'all' }): string {
  const out = new URLSearchParams();
  if (state.q) out.set('q', state.q);
  if (scope.kind !== 'category' && state.categories.length > 0) {
    out.set('category', state.categories.join(','));
  }
  if (state.sizes.length > 0) out.set('size', state.sizes.join(','));
  if (state.colors.length > 0) out.set('color', state.colors.join(','));
  if (state.minPrice !== undefined) out.set('min', String(state.minPrice));
  if (state.maxPrice !== undefined) out.set('max', String(state.maxPrice));
  if (state.inStock) out.set('stock', '1');
  if (state.onSale) out.set('sale', '1');
  if (state.onlyNew) out.set('new', '1');
  if (state.sort !== DEFAULT_SORT) out.set('sort', state.sort);
  if (state.page > 1) out.set('page', String(state.page));
  // Commas are fine in a query string and keep the URL readable.
  return out.toString().replace(/%2C/g, ',');
}

export function toCatalogQuery(state: ShopState, scope: ShopScope): CatalogQuery {
  const categories = scope.kind === 'category' ? [scope.id] : state.categories;
  return {
    ...(state.q ? { q: state.q } : {}),
    ...(categories.length > 0 ? { categories } : {}),
    ...(state.sizes.length > 0 ? { sizes: state.sizes } : {}),
    ...(state.colors.length > 0 ? { colors: state.colors } : {}),
    ...(state.minPrice !== undefined ? { minPrice: state.minPrice } : {}),
    ...(state.maxPrice !== undefined ? { maxPrice: state.maxPrice } : {}),
    ...(state.inStock ? { inStock: true } : {}),
    ...(state.onSale ? { onSale: true } : {}),
    ...(state.onlyNew ? { onlyNew: true } : {}),
    ...(scope.kind === 'collection' ? { collection: scope.id } : {}),
    sort: state.sort,
    page: state.page,
    pageSize: PAGE_SIZE,
  };
}

/** How many filters are active (the search text counts; sort and page do not). */
export function activeFilterCount(state: ShopState, scope: ShopScope = { kind: 'all' }): number {
  return (
    (state.q ? 1 : 0) +
    (scope.kind === 'category' ? 0 : state.categories.length) +
    state.sizes.length +
    state.colors.length +
    (state.minPrice !== undefined || state.maxPrice !== undefined ? 1 : 0) +
    (state.inStock ? 1 : 0) +
    (state.onSale ? 1 : 0) +
    (state.onlyNew ? 1 : 0)
  );
}

/** A copy with every filter cleared but the sort kept. */
export function clearFilters(state: ShopState): ShopState {
  return { ...EMPTY_SHOP_STATE, sort: state.sort };
}

/** Changing any filter or the sort sends you back to page 1. */
export function withPageReset(state: ShopState): ShopState {
  return { ...state, page: 1 };
}

/**
 * Page numbers to show: always first and last, a window around the current page, and `null`
 * where a gap is collapsed into an ellipsis.
 */
export function pageWindow(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    const before = sorted[i - 1];
    if (before !== undefined && p - before > 1) out.push(null);
    out.push(p);
  });
  return out;
}

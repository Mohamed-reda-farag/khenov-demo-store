import { describe, expect, it } from 'vitest';
import {
  EMPTY_SHOP_STATE,
  PAGE_SIZE,
  activeFilterCount,
  clearFilters,
  pageWindow,
  parseShopParams,
  serializeShopParams,
  toCatalogQuery,
} from './shop-params';

const parse = (qs: string) => parseShopParams(new URLSearchParams(qs));

describe('parseShopParams', () => {
  it('returns defaults for an empty query string', () => {
    expect(parse('')).toEqual(EMPTY_SHOP_STATE);
  });

  it('reads every supported parameter', () => {
    const state = parse(
      'q=nile&category=boots,running&size=42,40&color=black,sand&min=1000&max=2500&stock=1&sale=1&new=1&sort=price-asc&page=2',
    );
    expect(state).toEqual({
      q: 'nile',
      categories: ['running', 'boots'],
      sizes: [40, 42],
      colors: ['black', 'sand'],
      minPrice: 1000,
      maxPrice: 2500,
      inStock: true,
      onSale: true,
      onlyNew: true,
      sort: 'price-asc',
      page: 2,
    });
  });

  it('ignores malformed or hostile values instead of failing', () => {
    const state = parse(
      'category=shoes,boots&size=abc,42,9999,-3&color=<script>,Black,navy&min=-5&max=x&sort=cheapest&page=0&stock=yes',
    );
    expect(state.categories).toEqual(['boots']);
    expect(state.sizes).toEqual([42]);
    expect(state.colors).toEqual(['navy']);
    expect(state.minPrice).toBeUndefined();
    expect(state.maxPrice).toBeUndefined();
    expect(state.sort).toBe('featured');
    expect(state.page).toBe(1);
    expect(state.inStock).toBe(false);
  });

  it('drops a max that is below the min and trims long search text', () => {
    expect(parse('min=2000&max=1000').maxPrice).toBeUndefined();
    expect(parse(`q=${'a'.repeat(200)}`).q).toHaveLength(80);
  });

  it('keeps Arabic search text intact', () => {
    expect(parse(`q=${encodeURIComponent('نيل لو')}`).q).toBe('نيل لو');
  });
});

describe('serializeShopParams', () => {
  it('omits defaults', () => {
    expect(serializeShopParams(EMPTY_SHOP_STATE)).toBe('');
    expect(serializeShopParams({ ...EMPTY_SHOP_STATE, page: 1, sort: 'featured' })).toBe('');
  });

  it('round-trips a full state', () => {
    const qs =
      'q=nile&category=running,boots&size=40,42&color=black,sand&min=1000&max=2500&stock=1&sale=1&new=1&sort=newest&page=3';
    const state = parse(qs);
    expect(parse(serializeShopParams(state))).toEqual(state);
  });

  it('round-trips Arabic text and keeps commas readable', () => {
    const state = { ...EMPTY_SHOP_STATE, q: 'أحذية رياضية', sizes: [40, 41] };
    const qs = serializeShopParams(state);
    expect(qs).toContain('size=40,41');
    expect(parse(qs)).toEqual(state);
  });

  it('leaves the category out when the route already fixes it', () => {
    const state = { ...EMPTY_SHOP_STATE, categories: ['boots' as const] };
    expect(serializeShopParams(state, { kind: 'category', id: 'sneakers' })).toBe('');
    expect(serializeShopParams(state)).toBe('category=boots');
  });
});

describe('toCatalogQuery and counts', () => {
  it('builds a repository query with paging and scope', () => {
    const state = parse('size=42&page=2&sort=rating');
    expect(toCatalogQuery(state, { kind: 'collection', id: 'after-dark' })).toEqual({
      sizes: [42],
      collection: 'after-dark',
      sort: 'rating',
      page: 2,
      pageSize: PAGE_SIZE,
    });
    expect(toCatalogQuery(state, { kind: 'category', id: 'boots' }).categories).toEqual(['boots']);
  });

  it('counts active filters, not sort or page, and a price range as one', () => {
    expect(activeFilterCount(parse('sort=newest&page=2'))).toBe(0);
    expect(activeFilterCount(parse('q=a&category=boots&size=40,41&min=1&max=9&stock=1'))).toBe(6);
    expect(activeFilterCount(parse('category=boots'), { kind: 'category', id: 'boots' })).toBe(0);
  });

  it('clearFilters keeps only the sort', () => {
    expect(clearFilters(parse('q=a&size=40&sort=newest&page=2'))).toEqual({
      ...EMPTY_SHOP_STATE,
      sort: 'newest',
    });
  });
});

describe('pageWindow', () => {
  it('lists every page when there are few', () => {
    expect(pageWindow(1, 1)).toEqual([1]);
    expect(pageWindow(2, 3)).toEqual([1, 2, 3]);
  });

  it('collapses gaps into ellipses and always keeps first and last', () => {
    expect(pageWindow(1, 12)).toEqual([1, 2, 3, 4, null, 12]);
    expect(pageWindow(6, 12)).toEqual([1, null, 5, 6, 7, null, 12]);
    expect(pageWindow(12, 12)).toEqual([1, null, 9, 10, 11, 12]);
  });
});

import { describe, expect, it } from 'vitest';
import { normalizeSearch } from '@/lib/text';
import { CATEGORIES, PRODUCTS } from '../seed';
import { queryCatalog, relatedTo, suggestFrom } from './catalog.query';

const run = (query: Parameters<typeof queryCatalog>[2]) =>
  queryCatalog(PRODUCTS, CATEGORIES, query);

describe('normalizeSearch', () => {
  it('unifies Arabic letter variants, strips diacritics and converts digits', () => {
    expect(normalizeSearch('أَحْذِيَة')).toBe(normalizeSearch('احذيه'));
    expect(normalizeSearch('مدرسة')).toBe(normalizeSearch('مدرسه'));
    expect(normalizeSearch('مقاس ٤٢')).toBe('مقاس 42');
    expect(normalizeSearch('  NiLe   LOW ')).toBe('nile low');
  });
});

describe('queryCatalog', () => {
  it('paginates and reports totals', () => {
    const first = run({ pageSize: 10 });
    expect(first.total).toBe(PRODUCTS.length);
    expect(first.items).toHaveLength(10);
    expect(first.pageCount).toBe(3);
    expect(run({ pageSize: 10, page: 3 }).items).toHaveLength(4);
    expect(run({ pageSize: 10, page: 99 }).page).toBe(3);
  });

  it('filters by category, color, size, price and collection', () => {
    expect(run({ categories: ['boots'] }).items.every((p) => p.categoryId === 'boots')).toBe(true);
    expect(
      run({ colors: ['cobalt'] }).items.every((p) => p.colors.some((c) => c.id === 'cobalt')),
    ).toBe(true);
    const priced = run({ minPrice: 1000, maxPrice: 2000, pageSize: 50 }).items;
    expect(priced.length).toBeGreaterThan(0);
    expect(priced.every((p) => p.priceEGP >= 1000 && p.priceEGP <= 2000)).toBe(true);
    expect(
      run({ collection: 'desert-light', pageSize: 50 }).items.every((p) =>
        p.collectionIds.includes('desert-light'),
      ),
    ).toBe(true);
  });

  it('size filter only matches sizes that are actually in stock', () => {
    const items = run({ sizes: [42], pageSize: 50 }).items;
    expect(items.length).toBeGreaterThan(0);
    for (const p of items) {
      expect(p.sizes.find((s) => s.size === 42)?.stock ?? 0).toBeGreaterThan(0);
    }
  });

  it('sorts correctly', () => {
    const asc = run({ sort: 'price-asc', pageSize: 50 }).items.map((p) => p.priceEGP);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const newest = run({ sort: 'newest', pageSize: 50 }).items.map((p) => p.createdAt);
    expect(newest).toEqual([...newest].sort().reverse());
    expect(run({ sort: 'rating' }).items[0]?.rating).toBe(4.9);
  });

  it('searches Arabic and English names, colors and categories', () => {
    expect(run({ q: 'نيل' }).items.map((p) => p.slug)).toContain('nile-low');
    expect(run({ q: 'chelsea' }).items.map((p) => p.slug)).toEqual(['atlas-chelsea']);
    expect(run({ q: 'كحلي' }).total).toBeGreaterThan(0);
    expect(run({ q: 'صنادل' }).items.every((p) => p.categoryId === 'sandals')).toBe(true);
    expect(run({ q: 'zzzz-no-match' }).total).toBe(0);
  });

  it('facet counts ignore their own filter so options stay selectable', () => {
    const page = run({ categories: ['boots'] });
    const sneakers = page.facets.categories.find((c) => c.id === 'sneakers');
    expect(sneakers?.count).toBe(6);
    expect(page.facets.price.min).toBeLessThan(page.facets.price.max);
  });
});

describe('suggestions and related', () => {
  it('suggests categories and products for a prefix, in either language', () => {
    const results = suggestFrom(PRODUCTS, CATEGORIES, 'sne', 6);
    expect(results.some((r) => r.kind === 'category')).toBe(true);
    expect(suggestFrom(PRODUCTS, CATEGORIES, '', 6)).toEqual([]);
    expect(suggestFrom(PRODUCTS, CATEGORIES, 'زمالك', 6)[0]).toMatchObject({ kind: 'product' });
  });

  it('related products exclude the source and prefer the same category', () => {
    const source = PRODUCTS.find((p) => p.slug === 'nile-low')!;
    const related = relatedTo(PRODUCTS, source, 4);
    expect(related).toHaveLength(4);
    expect(related.every((p) => p.id !== source.id)).toBe(true);
    expect(related.filter((p) => p.categoryId === 'sneakers').length).toBeGreaterThanOrEqual(3);
  });
});

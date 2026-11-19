import { describe, expect, it } from 'vitest';
import { allSizes, colorHasStock, isProductSoldOut, stockLevel } from '../stock';
import { TEST_MANIFEST, TEST_PRODUCTS as PRODUCTS } from '../testing';
import { BANNERS, CATEGORIES, COLLECTIONS, REVIEWS } from './index';
import { buildProducts } from './products';
import { PHOTO_COLORS } from './photo-colors';

describe('seed data integrity', () => {
  it('has the agreed shape: 24 products, 5 categories, collections, banners', () => {
    expect(PRODUCTS).toHaveLength(24);
    expect(CATEGORIES).toHaveLength(5);
    expect(COLLECTIONS.length).toBeGreaterThanOrEqual(3);
    expect(BANNERS.length).toBeGreaterThanOrEqual(3);
  });

  it('has unique ids, slugs and skus', () => {
    for (const key of ['id', 'slug', 'sku'] as const) {
      expect(new Set(PRODUCTS.map((p) => p[key])).size).toBe(PRODUCTS.length);
    }
  });

  it('every product references real categories and collections and has complete bilingual copy', () => {
    const categoryIds = new Set(CATEGORIES.map((c) => c.id));
    const collectionIds = new Set(COLLECTIONS.map((c) => c.id));
    for (const p of PRODUCTS) {
      expect(categoryIds.has(p.categoryId)).toBe(true);
      p.collectionIds.forEach((id) => expect(collectionIds.has(id)).toBe(true));
      for (const text of [p.name, p.tagline, p.description, p.materials]) {
        expect(text.ar.trim().length).toBeGreaterThan(1);
        expect(text.en.trim().length).toBeGreaterThan(1);
        expect(text.ar + text.en).not.toMatch(/lorem|ipsum/i);
      }
    }
  });

  it('has realistic prices, ratings, colors and stock', () => {
    for (const p of PRODUCTS) {
      expect(p.priceEGP).toBeGreaterThanOrEqual(500);
      expect(p.priceEGP).toBeLessThanOrEqual(5000);
      if (p.compareAtPriceEGP) expect(p.compareAtPriceEGP).toBeGreaterThan(p.priceEGP);
      expect(p.rating).toBeGreaterThanOrEqual(1);
      expect(p.rating).toBeLessThanOrEqual(5);
      expect(p.colors.length).toBeGreaterThanOrEqual(2);
      expect(allSizes(p).length).toBeGreaterThanOrEqual(7);
      for (const color of p.colors) {
        expect(color.sizes.length).toBe(allSizes(p).length);
        expect(color.sizes.every((s) => Number.isInteger(s.stock) && s.stock >= 0)).toBe(true);
      }
    }
  });

  it('keeps every product buyable except the deliberate sold-out scenarios', () => {
    const soldOutProducts = PRODUCTS.filter(isProductSoldOut).map((p) => p.slug);
    expect(soldOutProducts).toEqual(['garden-city-mule']);
    const partlySoldOut = PRODUCTS.filter(
      (p) => !isProductSoldOut(p) && p.colors.some((c) => !colorHasStock(c)),
    );
    expect(partlySoldOut.length).toBeGreaterThanOrEqual(3);
  });

  it('sells a colour only when it has photos, except the sold-out scenario', () => {
    const products = buildProducts({
      'nile-low': { sand: 2 },
      'dune-court': { sand: 1, black: 3 },
    });
    const nile = products.find((p) => p.slug === 'nile-low')!;
    expect(nile.colors.filter(colorHasStock).map((c) => c.id)).toEqual(['sand']);
    const dune = products.find((p) => p.slug === 'dune-court')!;
    expect(dune.colors.filter(colorHasStock).map((c) => c.id)).toEqual(['sand', 'black']);
    expect(isProductSoldOut(products.find((p) => p.slug === 'souk-canvas')!)).toBe(true);
    const mule = buildProducts({ 'garden-city-mule': { sand: 2 } }).find(
      (p) => p.slug === 'garden-city-mule',
    )!;
    expect(isProductSoldOut(mule)).toBe(true);
  });

  it('keeps the photographed-colour fallback pointing at a real colour of each product', () => {
    expect(Object.keys(PHOTO_COLORS).sort()).toEqual(PRODUCTS.map((p) => p.slug).sort());
    for (const p of PRODUCTS) {
      expect(p.colors.map((c) => c.id)).toContain(PHOTO_COLORS[p.slug]);
      expect(Object.keys(TEST_MANIFEST[p.slug] ?? {})).toHaveLength(1);
    }
  });

  it('references real cover products from categories and banners', () => {
    const slugs = new Set(PRODUCTS.map((p) => p.slug));
    CATEGORIES.forEach((c) => expect(slugs.has(c.coverSlug)).toBe(true));
    BANNERS.forEach((b) => {
      if (b.productSlug) expect(slugs.has(b.productSlug)).toBe(true);
    });
  });

  it('has fictional sample reviews for every product, dated after the product exists', () => {
    for (const p of PRODUCTS) {
      const own = REVIEWS.filter((r) => r.productId === p.id);
      expect(own).toHaveLength(3);
      own.forEach((r) => {
        expect(r.rating).toBeGreaterThanOrEqual(1);
        expect(r.rating).toBeLessThanOrEqual(5);
        expect(r.date >= p.createdAt).toBe(true);
        expect(r.date <= '2026-11-16').toBe(true);
        expect(r.author.ar + r.author.en + r.body.ar + r.body.en).not.toMatch(/verified|موثق/i);
      });
    }
    expect(new Set(REVIEWS.map((r) => r.id)).size).toBe(REVIEWS.length);
  });

  it('exercises every stock state somewhere (sold out, low, healthy)', () => {
    const levels = new Set(
      PRODUCTS.flatMap((p) => p.colors.flatMap((c) => c.sizes.map((s) => stockLevel(s.stock)))),
    );
    expect(levels).toEqual(new Set(['out', 'low', 'in']));
  });

  it('is deterministic between evaluations', () => {
    expect(JSON.stringify(PRODUCTS)).toBe(JSON.stringify(PRODUCTS));
    expect(JSON.stringify(REVIEWS)).toBe(JSON.stringify(REVIEWS));
  });

  it('contains no real brand names', () => {
    const blob = JSON.stringify([PRODUCTS, CATEGORIES, COLLECTIONS, BANNERS]).toLowerCase();
    for (const brand of [
      'nike',
      'adidas',
      'puma',
      'reebok',
      'converse',
      'vans',
      'new balance',
      'asics',
      'skechers',
    ]) {
      expect(blob).not.toContain(brand);
    }
  });
});

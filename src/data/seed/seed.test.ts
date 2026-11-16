import { describe, expect, it } from 'vitest';
import { BANNERS, CATEGORIES, COLLECTIONS, PRODUCTS } from './index';

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
      expect(p.sizes.length).toBeGreaterThanOrEqual(7);
      expect(p.sizes.some((s) => s.stock > 0)).toBe(true);
      expect(p.sizes.every((s) => Number.isInteger(s.stock) && s.stock >= 0)).toBe(true);
    }
  });

  it('exercises every stock state somewhere (sold out, low, healthy)', () => {
    const stocks = PRODUCTS.flatMap((p) => p.sizes.map((s) => s.stock));
    expect(stocks.some((s) => s === 0)).toBe(true);
    expect(stocks.some((s) => s >= 1 && s <= 3)).toBe(true);
    expect(stocks.some((s) => s >= 8)).toBe(true);
  });

  it('is deterministic between evaluations', () => {
    expect(PRODUCTS[0]?.sizes).toEqual(PRODUCTS[0]?.sizes);
    expect(JSON.stringify(PRODUCTS)).toBe(JSON.stringify(PRODUCTS));
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

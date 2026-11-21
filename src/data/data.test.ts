import { describe, expect, it } from 'vitest';
import { ratingDistribution } from './rating';
import { buildProducts } from './seed/products';
import { TEST_PRODUCTS as PRODUCTS } from './testing';
import {
  LOW_STOCK_MAX,
  allSizes,
  colorHasStock,
  defaultColor,
  isProductSoldOut,
  sizeStock,
  stockLevel,
} from './stock';

describe('stock helpers', () => {
  it('classifies stock levels at the boundaries', () => {
    expect(stockLevel(0)).toBe('out');
    expect(stockLevel(1)).toBe('low');
    expect(stockLevel(LOW_STOCK_MAX)).toBe('low');
    expect(stockLevel(LOW_STOCK_MAX + 1)).toBe('in');
  });

  it('opens on the first colour that can be bought', () => {
    const dune = PRODUCTS.find((p) => p.slug === 'dune-court')!;
    expect(dune.colors[0]?.id).toBe('sand');
    const corniche = PRODUCTS.find((p) => p.slug === 'corniche-hi')!;
    expect(defaultColor(corniche)?.id).toBe('black');
    const mule = PRODUCTS.find((p) => p.slug === 'garden-city-mule')!;
    expect(isProductSoldOut(mule)).toBe(true);
    expect(defaultColor(mule)).toBe(mule.colors[0]);
    expect(colorHasStock(mule.colors[0]!)).toBe(false);
  });

  it('opens on the colour with the fullest gallery, not just the first one listed', () => {
    const derby = buildProducts({ 'khan-derby': { black: 1, brown: 3 } }).find(
      (p) => p.slug === 'khan-derby',
    )!;
    expect(derby.colors.map((c) => c.id)).toEqual(['black', 'tan', 'brown']);
    expect(defaultColor(derby, { 'khan-derby': { black: 1, brown: 3 } })?.id).toBe('brown');
    expect(defaultColor(derby, { 'khan-derby': { black: 1 } })?.id).toBe('black');
  });

  it('reads stock for a colour and size, and lists sizes ascending', () => {
    const nile = PRODUCTS.find((p) => p.slug === 'nile-low')!;
    const sizes = allSizes(nile);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(sizeStock(nile.colors[0], 999)).toBe(0);
    expect(sizeStock(undefined, 42)).toBe(0);
  });
});

describe('ratingDistribution', () => {
  it.each(PRODUCTS.map((p) => [p.slug, p.rating, p.reviewCount] as const))(
    'adds up and averages correctly for %s',
    (_slug, rating, count) => {
      const buckets = ratingDistribution(rating, count);
      expect(buckets.map((b) => b.star)).toEqual([5, 4, 3, 2, 1]);
      expect(buckets.reduce((sum, b) => sum + b.count, 0)).toBe(count);
      const mean = buckets.reduce((sum, b) => sum + b.star * b.count, 0) / count;
      expect(Math.abs(mean - rating)).toBeLessThan(0.06);
      expect(buckets.every((b) => b.count >= 0)).toBe(true);
    },
  );
});

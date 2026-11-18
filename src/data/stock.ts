import type { Product, ProductColor } from './types';

/** At or below this many pairs a size is shown as "low stock". */
export const LOW_STOCK_MAX = 3;

export type StockLevel = 'out' | 'low' | 'in';

export function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return 'out';
  return stock <= LOW_STOCK_MAX ? 'low' : 'in';
}

export const colorHasStock = (color: ProductColor): boolean => color.sizes.some((s) => s.stock > 0);

export const isProductSoldOut = (product: Product): boolean => !product.colors.some(colorHasStock);

export function findColor(product: Product, colorId: string | undefined): ProductColor | undefined {
  return product.colors.find((c) => c.id === colorId);
}

export function sizeStock(color: ProductColor | undefined, size: number): number {
  return color?.sizes.find((s) => s.size === size)?.stock ?? 0;
}

/** Every EU size the product is made in, ascending (identical across colours in the seed). */
export function allSizes(product: Product): number[] {
  const sizes = new Set<number>();
  product.colors.forEach((c) => c.sizes.forEach((s) => sizes.add(s.size)));
  return [...sizes].sort((a, b) => a - b);
}

/** The colour a page should open on: the first one that can actually be bought. */
export function defaultColor(product: Product): ProductColor | undefined {
  return product.colors.find(colorHasStock) ?? product.colors[0];
}

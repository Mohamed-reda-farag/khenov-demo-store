import { MAX_PER_LINE } from '@/data/limits';
import { findColor, sizeStock } from '@/data/stock';
import type { CartLine, Product } from '@/data/types';

export const lineId = (productId: string, colorId: string, size: number): string =>
  `${productId}:${colorId}:${size}`;

/** Largest quantity a colour + size can be bought in. */
export function maxQuantityFor(product: Product, colorId: string, size: number): number {
  return Math.min(sizeStock(findColor(product, colorId), size), MAX_PER_LINE);
}

/** Builds a cart line for a chosen colour + size, or null when that choice is unavailable. */
export function buildLine(
  product: Product,
  colorId: string,
  size: number,
  quantity = 1,
): CartLine | null {
  const color = findColor(product, colorId);
  const max = maxQuantityFor(product, colorId, size);
  if (!color || max <= 0) return null;
  return {
    id: lineId(product.id, color.id, size),
    productId: product.id,
    slug: product.slug,
    name: product.name,
    categoryId: product.categoryId,
    colorId: color.id,
    colorName: color.name,
    colorHex: color.hex,
    size,
    quantity: Math.min(Math.max(1, Math.floor(quantity)), max),
    unitPriceEGP: product.priceEGP,
    maxQuantity: max,
  };
}

export type AddResult = 'added' | 'merged' | 'capped';

/** Adds a line, merging with an existing identical one and respecting its cap. */
export function addLine(
  lines: readonly CartLine[],
  line: CartLine,
): { lines: CartLine[]; result: AddResult } {
  const existing = lines.find((l) => l.id === line.id);
  if (!existing) return { lines: [...lines, line], result: 'added' };
  if (existing.quantity >= existing.maxQuantity) return { lines: [...lines], result: 'capped' };
  const quantity = Math.min(existing.quantity + line.quantity, existing.maxQuantity);
  return {
    lines: lines.map((l) => (l.id === line.id ? { ...l, quantity } : l)),
    result: 'merged',
  };
}

/**
 * Turns the lines of an earlier order into cart lines that match today's stock and prices.
 * Lines whose colour or size is gone are returned in `skipped`; quantities are capped to stock.
 */
export function reorderLines(
  orderLines: readonly CartLine[],
  products: readonly Product[],
): { lines: CartLine[]; skipped: CartLine[] } {
  const lines: CartLine[] = [];
  const skipped: CartLine[] = [];
  for (const old of orderLines) {
    const product = products.find((p) => p.id === old.productId);
    const rebuilt = product ? buildLine(product, old.colorId, old.size, old.quantity) : null;
    if (rebuilt) lines.push(rebuilt);
    else skipped.push(old);
  }
  return { lines, skipped };
}

export function setLineQuantity(
  lines: readonly CartLine[],
  id: string,
  quantity: number,
): CartLine[] {
  return lines.map((l) =>
    l.id === id ? { ...l, quantity: Math.min(Math.max(1, quantity), l.maxQuantity) } : l,
  );
}

/** Applies fresh catalogue data to a line (new stock cap and/or price), keeping the quantity valid. */
export function refreshLine(
  lines: readonly CartLine[],
  id: string,
  patch: { maxQuantity?: number; unitPriceEGP?: number },
): CartLine[] {
  return lines.map((l) => {
    if (l.id !== id) return l;
    const maxQuantity = Math.max(1, patch.maxQuantity ?? l.maxQuantity);
    return {
      ...l,
      maxQuantity,
      quantity: Math.min(l.quantity, maxQuantity),
      unitPriceEGP: patch.unitPriceEGP ?? l.unitPriceEGP,
    };
  });
}

export function removeLine(lines: readonly CartLine[], id: string): CartLine[] {
  return lines.filter((l) => l.id !== id);
}

/** Re-inserts a removed line at its previous position (used by Undo). */
export function restoreLine(lines: readonly CartLine[], line: CartLine, index: number): CartLine[] {
  if (lines.some((l) => l.id === line.id)) return [...lines];
  const next = [...lines];
  next.splice(Math.min(Math.max(0, index), next.length), 0, line);
  return next;
}

export const itemCount = (lines: readonly CartLine[]): number =>
  lines.reduce((sum, l) => sum + l.quantity, 0);

export const subtotal = (lines: readonly CartLine[]): number =>
  lines.reduce((sum, l) => sum + l.quantity * l.unitPriceEGP, 0);

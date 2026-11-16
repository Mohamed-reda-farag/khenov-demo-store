import type { CartLine, Product } from '@/data/types';

/** Per-line quantity cap (also bounded by the stock of the chosen size). */
export const MAX_PER_LINE = 10;

export const lineId = (productId: string, colorId: string, size: number): string =>
  `${productId}:${colorId}:${size}`;

/** Builds a cart line for a chosen colour + size, or null when that choice is unavailable. */
export function buildLine(product: Product, colorId: string, size: number): CartLine | null {
  const color = product.colors.find((c) => c.id === colorId);
  const stock = product.sizes.find((s) => s.size === size)?.stock ?? 0;
  if (!color || stock <= 0) return null;
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
    quantity: 1,
    unitPriceEGP: product.priceEGP,
    maxQuantity: Math.min(stock, MAX_PER_LINE),
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
  return {
    lines: lines.map((l) => (l.id === line.id ? { ...l, quantity: l.quantity + 1 } : l)),
    result: 'merged',
  };
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

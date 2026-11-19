import { findColor, sizeStock } from '../stock';
import type { CartLine, Product } from '../types';

export type LineIssue =
  /** The product, colour or size cannot be bought any more. */
  | { kind: 'unavailable'; lineId: string }
  /** Fewer pairs are left than the quantity in the cart. */
  | { kind: 'insufficient'; lineId: string; available: number }
  /** The price changed since the pair was added. */
  | { kind: 'price-changed'; lineId: string; from: number; to: number };

/** Compares cart lines with the current catalogue. Never throws: a missing product is an issue. */
export function checkLines(lines: readonly CartLine[], products: readonly Product[]): LineIssue[] {
  const issues: LineIssue[] = [];
  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId);
    const color = product ? findColor(product, line.colorId) : undefined;
    const available = sizeStock(color, line.size);
    if (!product || available <= 0) {
      issues.push({ kind: 'unavailable', lineId: line.id });
      continue;
    }
    if (line.quantity > available) {
      issues.push({ kind: 'insufficient', lineId: line.id, available });
    }
    if (product.priceEGP !== line.unitPriceEGP) {
      issues.push({
        kind: 'price-changed',
        lineId: line.id,
        from: line.unitPriceEGP,
        to: product.priceEGP,
      });
    }
  }
  return issues;
}

/** Issues that stop the order from being placed as it is (a price change is only a notice). */
export const isBlocking = (issue: LineIssue): boolean => issue.kind !== 'price-changed';

export const issuesFor = (issues: readonly LineIssue[], lineId: string): LineIssue[] =>
  issues.filter((i) => i.lineId === lineId);

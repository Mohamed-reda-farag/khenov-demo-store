import type { OrderTotals, ShippingMethodId } from '../types';
import type { PromoResult } from './promo';
import { shippingCost } from './shipping';

export interface Totals extends OrderTotals {
  freeShipping: boolean;
}

/**
 * Subtotal, discount, shipping and total (EGP). A promo that is not `ok` simply gives no
 * discount, so callers can pass whatever the evaluation returned.
 */
export function computeTotals(
  subtotal: number,
  method: ShippingMethodId,
  promo: PromoResult | null,
): Totals {
  const applied = promo?.ok ? promo : null;
  const discount = Math.min(applied?.discount ?? 0, subtotal);
  const shipping = shippingCost(method, subtotal, applied?.freeShipping ?? false);
  return {
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
    freeShipping: subtotal > 0 && shipping === 0,
  };
}

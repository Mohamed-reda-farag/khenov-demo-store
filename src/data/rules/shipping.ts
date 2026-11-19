import type { ShippingMethodId } from '../types';

export interface ShippingMethod {
  id: ShippingMethodId;
  priceEGP: number;
  /** Working days (Saturday to Thursday). */
  minDays: number;
  maxDays: number;
}

export const SHIPPING_METHODS: readonly ShippingMethod[] = [
  { id: 'standard', priceEGP: 60, minDays: 3, maxDays: 5 },
  { id: 'express', priceEGP: 120, minDays: 1, maxDays: 2 },
];

/** Standard shipping is free from this subtotal (EGP). */
export const FREE_SHIPPING_THRESHOLD = 2500;

export const shippingMethod = (id: ShippingMethodId): ShippingMethod => {
  const found = SHIPPING_METHODS.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown shipping method: ${id}`);
  return found;
};

/** True when the cart earns free delivery by itself (standard only; express is always paid). */
export const qualifiesForFreeShipping = (id: ShippingMethodId, subtotal: number): boolean =>
  id === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD;

export function shippingCost(
  id: ShippingMethodId,
  subtotal: number,
  promoFreeShipping: boolean,
): number {
  if (subtotal <= 0 || promoFreeShipping || qualifiesForFreeShipping(id, subtotal)) return 0;
  return shippingMethod(id).priceEGP;
}

/** How much more to add for free standard shipping (0 once reached). */
export const amountToFreeShipping = (subtotal: number): number =>
  Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

/** Adds working days, skipping Fridays (the weekly day off for couriers). */
export function addWorkingDays(from: Date, days: number): Date {
  const result = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    if (result.getUTCDay() !== 5) remaining -= 1;
  }
  return result;
}

export function estimateDelivery(id: ShippingMethodId, from: Date): { from: Date; to: Date } {
  const method = shippingMethod(id);
  return { from: addWorkingDays(from, method.minDays), to: addWorkingDays(from, method.maxDays) };
}

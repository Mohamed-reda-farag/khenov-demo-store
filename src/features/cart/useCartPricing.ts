'use client';

import { useMemo } from 'react';
import { evaluatePromo, type PromoResult } from '@/data/rules/promo';
import { computeTotals, type Totals } from '@/data/rules/totals';
import type { ShippingMethodId } from '@/data/types';
import { useNow } from '@/lib/hooks/useNow';
import { subtotal as sumSubtotal } from './cart.logic';
import { useCartStore } from './cart.store';

export interface CartPricing {
  subtotal: number;
  /** The result of checking the stored promo code against the current subtotal (null: none). */
  promo: PromoResult | null;
  totals: Totals;
}

/** Totals for the cart as it is now; the promo code is re-checked whenever the cart changes. */
export function useCartPricing(method: ShippingMethodId): CartPricing {
  const lines = useCartStore((s) => s.lines);
  const code = useCartStore((s) => s.promoCode);
  const now = useNow(60_000);
  return useMemo(() => {
    const subtotal = sumSubtotal(lines);
    const promo = code ? evaluatePromo(code, subtotal, now) : null;
    return { subtotal, promo, totals: computeTotals(subtotal, method, promo) };
  }, [lines, code, now, method]);
}

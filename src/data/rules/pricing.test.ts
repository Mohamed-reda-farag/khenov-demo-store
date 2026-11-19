import { describe, expect, it } from 'vitest';
import { evaluatePromo, HINT_CODES, PROMO_CODES } from './promo';
import {
  addWorkingDays,
  amountToFreeShipping,
  estimateDelivery,
  FREE_SHIPPING_THRESHOLD,
  shippingCost,
} from './shipping';
import { computeTotals } from './totals';

const NOW = new Date('2026-11-19T10:00:00Z');

describe('evaluatePromo', () => {
  it('applies a percentage, ignoring case and spaces, rounding the discount down', () => {
    expect(evaluatePromo(' athar10 ', 1999, NOW)).toMatchObject({ ok: true, discount: 199 });
    expect(evaluatePromo('ATAR10', 1999, NOW)).toMatchObject({ ok: false, reason: 'unknown' });
  });

  it('applies a fixed amount only from its minimum subtotal', () => {
    expect(evaluatePromo('WELCOME150', 999, NOW)).toMatchObject({
      ok: false,
      reason: 'min-subtotal',
    });
    expect(evaluatePromo('WELCOME150', 1000, NOW)).toMatchObject({ ok: true, discount: 150 });
  });

  it('free-shipping codes discount nothing but flag free delivery', () => {
    expect(evaluatePromo('FREESHIP', 500, NOW)).toMatchObject({
      ok: true,
      discount: 0,
      freeShipping: true,
    });
  });

  it('reports expired, unknown and empty codes with their reason', () => {
    expect(evaluatePromo('SUMMER25', 2000, NOW)).toMatchObject({ ok: false, reason: 'expired' });
    expect(evaluatePromo('NOPE', 2000, NOW)).toMatchObject({ ok: false, reason: 'unknown' });
    expect(evaluatePromo('   ', 2000, NOW)).toEqual({ ok: false, reason: 'empty' });
  });

  it('treats the last valid day as still valid (Cairo time)', () => {
    const lastDay = new Date('2026-08-31T20:00:00Z'); // 23:00 in Cairo
    const nextDay = new Date('2026-08-31T22:30:00Z'); // 01:30 on Sept 1 in Cairo
    expect(evaluatePromo('SUMMER25', 1000, lastDay).ok).toBe(true);
    expect(evaluatePromo('SUMMER25', 1000, nextDay)).toMatchObject({ reason: 'expired' });
  });

  it('advertises only codes that exist and work', () => {
    for (const code of HINT_CODES) {
      expect(PROMO_CODES.some((p) => p.code === code)).toBe(true);
      expect(evaluatePromo(code, 5000, NOW).ok).toBe(true);
    }
  });
});

describe('shipping', () => {
  it('charges per method and is free for an empty cart', () => {
    expect(shippingCost('standard', 1000, false)).toBe(60);
    expect(shippingCost('express', 1000, false)).toBe(120);
    expect(shippingCost('standard', 0, false)).toBe(0);
  });

  it('gives free standard shipping from the threshold, but express stays paid', () => {
    expect(shippingCost('standard', FREE_SHIPPING_THRESHOLD - 1, false)).toBe(60);
    expect(shippingCost('standard', FREE_SHIPPING_THRESHOLD, false)).toBe(0);
    expect(shippingCost('express', FREE_SHIPPING_THRESHOLD, false)).toBe(120);
  });

  it('a free-shipping promo covers express too', () => {
    expect(shippingCost('express', 500, true)).toBe(0);
  });

  it('reports how far a cart is from free shipping', () => {
    expect(amountToFreeShipping(2000)).toBe(500);
    expect(amountToFreeShipping(3000)).toBe(0);
  });

  it('counts working days and skips Fridays', () => {
    const thursday = new Date('2026-11-19T00:00:00Z');
    expect(thursday.getUTCDay()).toBe(4);
    expect(addWorkingDays(thursday, 1).toISOString().slice(0, 10)).toBe('2026-11-21'); // Saturday
    expect(addWorkingDays(thursday, 0).toISOString().slice(0, 10)).toBe('2026-11-19');
    const estimate = estimateDelivery('standard', thursday);
    expect(estimate.from < estimate.to).toBe(true);
  });
});

describe('computeTotals', () => {
  it('adds shipping and subtracts the discount', () => {
    const promo = evaluatePromo('ATHAR10', 1000, NOW);
    expect(computeTotals(1000, 'standard', promo)).toMatchObject({
      subtotal: 1000,
      discount: 100,
      shipping: 60,
      total: 960,
      freeShipping: false,
    });
  });

  it('ignores a promo that is not valid', () => {
    const bad = evaluatePromo('NOPE', 1000, NOW);
    expect(computeTotals(1000, 'standard', bad).discount).toBe(0);
    expect(computeTotals(1000, 'standard', null).total).toBe(1060);
  });

  it('flags free shipping and totals an empty cart as zero', () => {
    const totals = computeTotals(3000, 'standard', null);
    expect(totals).toMatchObject({ shipping: 0, total: 3000, freeShipping: true });
    expect(computeTotals(0, 'standard', null)).toMatchObject({ total: 0, freeShipping: false });
  });

  it('keeps the total non-negative when a discount exceeds the subtotal', () => {
    const free = evaluatePromo('FREESHIP', 200, NOW);
    expect(computeTotals(200, 'express', free).total).toBe(200);
  });
});

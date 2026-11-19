import type { LocaleText } from '../types';

export type PromoKind = 'percent' | 'fixed' | 'free-shipping';

export interface PromoCode {
  code: string;
  kind: PromoKind;
  /** Percent (1..100) or EGP amount; unused for free shipping. */
  value: number;
  /** Cart subtotal (EGP) needed before the code applies. */
  minSubtotal?: number;
  /** Last day the code works (ISO date, inclusive, Cairo time). */
  expiresOn?: string;
  description: LocaleText;
}

/** Demo codes. The first three are shown as hints; SUMMER25 exists to show the "expired" state. */
export const PROMO_CODES: readonly PromoCode[] = [
  {
    code: 'ATHAR10',
    kind: 'percent',
    value: 10,
    description: { ar: 'خصم ١٠٪ على المشتريات', en: '10% off your order' },
  },
  {
    code: 'WELCOME150',
    kind: 'fixed',
    value: 150,
    minSubtotal: 1000,
    description: {
      ar: 'خصم ١٥٠ جنيهًا على مشتريات ١٬٠٠٠ جنيه أو أكثر',
      en: 'EGP 150 off orders of EGP 1,000 or more',
    },
  },
  {
    code: 'FREESHIP',
    kind: 'free-shipping',
    value: 0,
    description: { ar: 'شحن مجاني بأي طريقة توصيل', en: 'Free shipping on any delivery method' },
  },
  {
    code: 'SUMMER25',
    kind: 'percent',
    value: 25,
    expiresOn: '2026-08-31',
    description: { ar: 'عرض الصيف (منتهي)', en: 'Summer offer (ended)' },
  },
];

/** Codes advertised as hints in the cart. */
export const HINT_CODES: readonly string[] = ['ATHAR10', 'WELCOME150', 'FREESHIP'];

export type PromoFailure = 'empty' | 'unknown' | 'expired' | 'min-subtotal';

export type PromoResult =
  | { ok: true; promo: PromoCode; discount: number; freeShipping: boolean }
  | { ok: false; reason: PromoFailure; promo?: PromoCode };

export const normalizePromoCode = (input: string): string => input.trim().toUpperCase();

const cairoDay = (now: Date): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(now);

/** Checks a typed code against the cart subtotal (EGP). Pure: the clock is passed in. */
export function evaluatePromo(input: string, subtotal: number, now: Date): PromoResult {
  const code = normalizePromoCode(input);
  if (code === '') return { ok: false, reason: 'empty' };
  const promo = PROMO_CODES.find((p) => p.code === code);
  if (!promo) return { ok: false, reason: 'unknown' };
  if (promo.expiresOn && cairoDay(now) > promo.expiresOn) {
    return { ok: false, reason: 'expired', promo };
  }
  if (promo.minSubtotal !== undefined && subtotal < promo.minSubtotal) {
    return { ok: false, reason: 'min-subtotal', promo };
  }
  const discount =
    promo.kind === 'percent'
      ? Math.floor((subtotal * promo.value) / 100)
      : promo.kind === 'fixed'
        ? Math.min(promo.value, subtotal)
        : 0;
  return { ok: true, promo, discount, freeShipping: promo.kind === 'free-shipping' };
}

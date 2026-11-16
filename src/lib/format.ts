import type { Locale } from '@/data/types';

/**
 * Locale-aware formatting. Arabic uses the ar-EG locale (Arabic-Indic digits,
 * Egyptian currency symbol). To switch Arabic to Western digits, change
 * ARABIC_NUMBERING to 'latn' — it is the only place that decides.
 */
const ARABIC_NUMBERING: 'arab' | 'latn' = 'arab';

const intlLocale = (locale: Locale): string =>
  locale === 'ar' ? `ar-EG-u-nu-${ARABIC_NUMBERING}` : 'en-EG';

export function formatPrice(amountEGP: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(amountEGP);
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

export function formatRating(value: number, locale: Locale): string {
  return formatNumber(value, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function formatDate(
  value: Date | string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' },
): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: 'Africa/Cairo',
    ...options,
  }).format(date);
}

export function discountPercent(price: number, compareAt?: number): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

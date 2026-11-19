'use client';

import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import type { Locale, LocaleText } from '@/data/types';
import {
  discountPercent,
  formatDate,
  formatList,
  formatNumber,
  formatPrice,
  formatRating,
} from '../format';

/** Locale-bound formatting helpers for client components. */
export function useFormat() {
  const locale = useLocale() as Locale;
  return useMemo(
    () => ({
      locale,
      price: (amount: number) => formatPrice(amount, locale),
      number: (value: number, options?: Intl.NumberFormatOptions) =>
        formatNumber(value, locale, options),
      rating: (value: number) => formatRating(value, locale),
      date: (value: Date | string, options?: Intl.DateTimeFormatOptions) =>
        formatDate(value, locale, options),
      list: (items: readonly string[]) => formatList(items, locale),
      percent: (value: number) => formatNumber(value / 100, locale, { style: 'percent' }),
      discount: discountPercent,
      text: (value: LocaleText) => value[locale],
    }),
    [locale],
  );
}

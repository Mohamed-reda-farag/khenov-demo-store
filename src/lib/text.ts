import type { Locale, LocaleText } from '@/data/types';

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩';
const EXTENDED_INDIC = '۰۱۲۳۴۵۶۷۸۹';

/**
 * Normalises text for searching in Arabic and English:
 * lower-case, strips diacritics + tatweel, unifies alef/ya/ta-marbuta variants,
 * and converts Arabic-Indic digits to Latin ones.
 */
export function normalizeSearch(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[ً-ٰٟـ̀-ͯ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[٠-٩]/g, (d) => String(ARABIC_INDIC.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(EXTENDED_INDIC.indexOf(d)))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function pick(text: LocaleText, locale: Locale): string {
  return text[locale];
}

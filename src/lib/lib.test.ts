import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import ar from '@/i18n/ar.json';
import en from '@/i18n/en.json';
import { contrastRatio } from './color';
import { discountPercent, formatNumber, formatPrice } from './format';
import imageLoader from './image-loader';

function flatten(obj: object, prefix = ''): Record<string, string> {
  return Object.entries(obj).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') acc[path] = value;
    else Object.assign(acc, flatten(value as object, path));
    return acc;
  }, {});
}

describe('i18n messages', () => {
  const arFlat = flatten(ar);
  const enFlat = flatten(en);

  it('Arabic and English have exactly the same keys', () => {
    expect(Object.keys(arFlat).sort()).toEqual(Object.keys(enFlat).sort());
  });

  it('has no empty strings, placeholders or lorem ipsum', () => {
    for (const [key, value] of [...Object.entries(arFlat), ...Object.entries(enFlat)]) {
      expect(value.trim(), key).not.toBe('');
      expect(value, key).not.toMatch(/lorem|ipsum|TODO/i);
    }
  });

  it('uses the same ICU arguments in both languages', () => {
    // Top-level ICU arguments only: skip plural branch labels such as "=0 {…}" / "one {…}".
    const args = (s: string) =>
      [...new Set(s.match(/(?<!(?:=\d+|zero|one|two|few|many|other)\s)\{(\w+)[,}]/g) ?? [])].sort();
    for (const key of Object.keys(arFlat)) {
      expect(args(arFlat[key]!), key).toEqual(args(enFlat[key]!));
    }
  });
});

describe('formatting', () => {
  it('formats EGP in both languages', () => {
    expect(formatPrice(1850, 'en')).toContain('1,850');
    expect(formatPrice(1850, 'en')).toMatch(/EGP/);
    expect(formatPrice(1850, 'ar')).toMatch(/[١٢٣٤٥٦٧٨٩٠]/);
    expect(formatPrice(1850, 'ar')).toMatch(/ج\.م/);
  });

  it('localises numbers and computes discounts', () => {
    expect(formatNumber(42, 'ar')).toBe('٤٢');
    expect(formatNumber(42, 'en')).toBe('42');
    expect(discountPercent(1950, 2400)).toBe(19);
    expect(discountPercent(1950)).toBe(0);
    expect(discountPercent(2400, 1950)).toBe(0);
  });
});

describe('image loader', () => {
  it('maps a requested width to the closest pre-built WebP', () => {
    expect(imageLoader({ src: '/images/products/nile-low/1', width: 300 })).toBe(
      '/images/products/nile-low/1-480.webp',
    );
    expect(imageLoader({ src: '/images/products/nile-low/1', width: 481 })).toBe(
      '/images/products/nile-low/1-960.webp',
    );
    expect(imageLoader({ src: '/images/products/nile-low/1', width: 5000 })).toBe(
      '/images/products/nile-low/1-1600.webp',
    );
  });
});

describe('design tokens', () => {
  const css = readFileSync(new URL('../theme/tokens.css', import.meta.url), 'utf8');
  const token = (name: string): string => {
    const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
    if (!match?.[1]) throw new Error(`missing token ${name}`);
    return match[1];
  };

  it.each([
    ['ink-900', 'paper', 7],
    ['ink-700', 'paper', 7],
    ['ink-500', 'paper', 4.5],
    ['accent-600', 'paper', 4.5],
    ['white', 'accent-600', 4.5],
    ['paper', 'ink-900', 7],
    ['white', 'danger-600', 4.5],
    ['success-600', 'success-100', 4.5],
    ['warning-700', 'warning-100', 4.5],
    ['sand-300', 'ink-900', 4.5],
  ])('%s on %s meets contrast %s:1', (fg, bg, min) => {
    const resolve = (n: string) => (n === 'white' ? '#ffffff' : token(n));
    expect(contrastRatio(resolve(fg), resolve(bg))).toBeGreaterThanOrEqual(min);
  });

  it('never letter-spaces Arabic', () => {
    expect(css).toMatch(/:lang\(ar\)\s*{[^}]*--tracking-display:\s*0/);
  });
});

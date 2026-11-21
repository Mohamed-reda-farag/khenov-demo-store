import { describe, expect, it } from 'vitest';
import ar from '@/i18n/ar.json';
import en from '@/i18n/en.json';
import { formatNumber } from '@/lib/format';
import { BANNERS } from '../seed/catalog-meta';
import { FREE_SHIPPING_THRESHOLD } from './shipping';

/** Marketing copy must quote the same threshold checkout applies. */
describe('free-shipping copy', () => {
  const inEn = formatNumber(FREE_SHIPPING_THRESHOLD, 'en');
  const inAr = formatNumber(FREE_SHIPPING_THRESHOLD, 'ar');
  const strip = BANNERS.find((banner) => banner.id === 'strip-shipping');

  it('English strings quote the rule', () => {
    expect(en.home.values.delivery.title).toContain(inEn);
    expect(en.product.deliveryBody).toContain(inEn);
    expect(strip?.title.en).toContain(inEn);
  });

  it('Arabic strings quote the rule', () => {
    expect(ar.home.values.delivery.title).toContain(inAr);
    expect(ar.product.deliveryBody).toContain(inAr);
    expect(strip?.title.ar).toContain(inAr);
  });
});

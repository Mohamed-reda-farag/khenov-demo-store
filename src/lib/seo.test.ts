import { describe, expect, it } from 'vitest';
import { pageMetadata, pageUrl, withBase } from './seo';

describe('seo helpers', () => {
  it('builds locale-prefixed page addresses', () => {
    expect(pageUrl('ar', '/shop/')).toBe(withBase('/ar/shop/'));
    expect(pageUrl('en', '/')).toBe(withBase('/en/'));
  });

  it('gives every page a canonical, both hreflang alternates and x-default', () => {
    const meta = pageMetadata({ locale: 'en', path: '/shop/', title: 'T', description: 'D' });
    expect(meta.alternates?.canonical).toBe(pageUrl('en', '/shop/'));
    expect(meta.alternates?.languages).toEqual({
      ar: pageUrl('ar', '/shop/'),
      en: pageUrl('en', '/shop/'),
      'x-default': pageUrl('ar', '/shop/'),
    });
  });

  it('prefixes share images with the base path and asks not to be indexed by default', () => {
    const meta = pageMetadata({
      locale: 'ar',
      path: '/product/x/',
      title: 'T',
      description: 'D',
      image: '/images/products/x/a-1-960.webp',
    });
    expect(meta.openGraph).toMatchObject({ images: [withBase('/images/products/x/a-1-960.webp')] });
    expect(meta.robots).toMatchObject({ index: false });
  });
});

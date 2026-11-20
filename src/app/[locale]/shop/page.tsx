import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ShopListing } from '@/features/shop/ShopListing';
import { ShopListingFallback } from '@/features/shop/ShopListingFallback';
import { shopInitial } from '@/features/shop/shop-initial';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'shop' });
  const brand = await getTranslations({ locale, namespace: 'brand' });
  const title = `${t('title')} — ${brand('name')}`;
  return pageMetadata({ locale, path: '/shop/', title, description: t('metaDescription') });
}

export default async function ShopPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const initial = shopInitial({ kind: 'all' });
  return (
    <Suspense fallback={<ShopListingFallback scope={{ kind: 'all' }} initial={initial} />}>
      <ShopListing scope={{ kind: 'all' }} initial={initial} />
    </Suspense>
  );
}

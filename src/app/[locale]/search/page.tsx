import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ShopListing, ShopListingSkeleton } from '@/features/shop/ShopListing';
import { routing } from '@/i18n/routing';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'search' });
  const brand = await getTranslations({ locale, namespace: 'brand' });
  const title = `${t('title')} — ${brand('name')}`;
  return {
    title,
    description: t('metaDescription'),
    openGraph: { title, description: t('metaDescription'), locale },
    robots: { index: false },
  };
}

export default async function ShopPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <Suspense fallback={<ShopListingSkeleton />}>
      <ShopListing scope={{ kind: 'all' }} mode="search" />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { catalogStatic } from '@/data/repository/catalog.static';
import { ShopListing, ShopListingSkeleton } from '@/features/shop/ShopListing';
import { routing } from '@/i18n/routing';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    catalogStatic.collectionSlugs().map((slug) => ({ locale, slug })),
  );
}

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const collection = catalogStatic.getCollection(slug);
  if (!hasLocale(routing.locales, locale) || !collection) return {};
  const brand = await getTranslations({ locale, namespace: 'brand' });
  const title = `${collection.name[locale]} — ${brand('name')}`;
  return {
    title,
    description: collection.blurb[locale],
    openGraph: { title, description: collection.blurb[locale], locale },
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const collection = catalogStatic.getCollection(slug);
  if (!hasLocale(routing.locales, locale) || !collection) notFound();
  setRequestLocale(locale);
  return (
    <Suspense fallback={<ShopListingSkeleton />}>
      <ShopListing
        scope={{ kind: 'collection', id: collection.id }}
        heading={{ name: collection.name, blurb: collection.blurb }}
      />
    </Suspense>
  );
}

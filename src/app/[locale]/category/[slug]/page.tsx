import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { catalogStatic } from '@/data/repository/catalog.static';
import { ShopListing } from '@/features/shop/ShopListing';
import { ShopListingFallback } from '@/features/shop/ShopListingFallback';
import { shopInitial } from '@/features/shop/shop-initial';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    catalogStatic.categorySlugs().map((slug) => ({ locale, slug })),
  );
}

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = catalogStatic.getCategory(slug);
  if (!hasLocale(routing.locales, locale) || !category) return {};
  const brand = await getTranslations({ locale, namespace: 'brand' });
  const title = `${category.name[locale]} — ${brand('name')}`;
  return pageMetadata({
    locale,
    path: `/category/${slug}/`,
    title,
    description: category.blurb[locale],
  });
}

export default async function CategoryPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const category = catalogStatic.getCategory(slug);
  if (!hasLocale(routing.locales, locale) || !category) notFound();
  setRequestLocale(locale);
  const initial = shopInitial({ kind: 'category', id: category.id });
  return (
    <Suspense
      fallback={
        <ShopListingFallback
          scope={{ kind: 'category', id: category.id }}
          heading={{ name: category.name, blurb: category.blurb }}
          initial={initial}
        />
      }
    >
      <ShopListing
        initial={initial}
        scope={{ kind: 'category', id: category.id }}
        heading={{ name: category.name, blurb: category.blurb }}
      />
    </Suspense>
  );
}

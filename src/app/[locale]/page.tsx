import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { catalogStatic } from '@/data/repository/catalog.static';
import { HomeView } from '@/features/home/HomeView';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale, path: '/', title: t('title'), description: t('description') });
}

export default async function HomePage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <HomeView
      initial={{
        banners: catalogStatic.banners(),
        tiles: catalogStatic.categoryTiles(),
        featured: catalogStatic.featured(8),
        newArrivals: catalogStatic.newArrivals(4),
      }}
    />
  );
}

import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { CartView } from '@/features/cart/CartView';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'cart' });
  const brand = await getTranslations({ locale, namespace: 'brand' });
  const title = `${t('title')} — ${brand('name')}`;
  return pageMetadata({ locale, path: '/cart/', title, description: t('metaDescription') });
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <CartView />;
}

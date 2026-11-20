import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ShippingPage } from '@/features/help/pages';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'help' });
  const brand = await getTranslations({ locale, namespace: 'brand' });
  const description = t('shipping.metaDescription');
  const title = `${t('pages.shipping')} — ${brand('name')}`;
  return pageMetadata({ locale, path: '/help/shipping/', title, description });
}

export default async function Page({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <ShippingPage />;
}

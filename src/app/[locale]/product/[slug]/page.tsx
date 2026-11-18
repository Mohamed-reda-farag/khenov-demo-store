import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { photoCount } from '@/data/images';
import { catalogStatic } from '@/data/repository/catalog.static';
import { ProductView } from '@/features/product/ProductView';
import { routing } from '@/i18n/routing';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    catalogStatic.productSlugs().map((slug) => ({ locale, slug })),
  );
}

type Params = Promise<{ locale: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = catalogStatic.getProduct(slug);
  if (!hasLocale(routing.locales, locale) || !product) return {};
  const brand = await getTranslations({ locale, namespace: 'brand' });
  const title = `${product.name[locale]} — ${brand('name')}`;
  const description = `${product.tagline[locale]}. ${product.description[locale]}`;
  const image = photoCount(slug) > 0 ? [`/images/products/${slug}/1-960.webp`] : [];
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/product/${slug}/`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/product/${slug}/`])),
    },
    openGraph: { title, description, type: 'website', locale, images: image },
    twitter: { card: image.length > 0 ? 'summary_large_image' : 'summary', title, description },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale) || !catalogStatic.getProduct(slug)) notFound();
  setRequestLocale(locale);
  return <ProductView slug={slug} />;
}

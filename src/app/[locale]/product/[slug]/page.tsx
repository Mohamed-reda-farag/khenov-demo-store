import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { mainPhotoColorId } from '@/data/images';
import { catalogStatic } from '@/data/repository/catalog.static';
import { ProductContent, ProductView } from '@/features/product/ProductView';
import { routing } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';

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
  const photoColor = mainPhotoColorId(slug);
  const image = photoColor ? `/images/products/${slug}/${photoColor}-1-960.webp` : undefined;
  return pageMetadata({ locale, path: `/product/${slug}/`, title, description, image });
}

export default async function ProductPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  const product = catalogStatic.getProduct(slug);
  if (!hasLocale(routing.locales, locale) || !product) notFound();
  setRequestLocale(locale);
  const category = catalogStatic.categories().find((c) => c.id === product.categoryId) ?? null;
  return (
    // The static HTML holds the real product (photo, name, price, sizes) in its default colour.
    // `?color=` can only be read in the browser, so ProductView picks the colour after hydration.
    <Suspense
      fallback={<ProductContent product={product} category={category} colorId={undefined} />}
    >
      <ProductView slug={slug} initial={{ product, category }} />
    </Suspense>
  );
}

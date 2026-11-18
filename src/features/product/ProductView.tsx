'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateBlocks';
import { buttonClasses } from '@/components/ui/Button';
import { catalogRepository } from '@/data/repository';
import { colorHasStock, isProductSoldOut } from '@/data/stock';
import type { Category, Product } from '@/data/types';
import { Price } from '@/features/catalog/components/Price';
import { Link } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';
import { Gallery } from './Gallery';
import { ProductDetails } from './ProductDetails';
import { PurchasePanel } from './PurchasePanel';
import { RatingSummary } from './RatingSummary';
import { RelatedProducts } from './RelatedProducts';
import { ReviewsSection } from './ReviewsSection';
import { StickyBuyBar } from './StickyBuyBar';
import { usePurchase } from './usePurchase';

async function loadProductPage(slug: string) {
  const [product, categories] = await Promise.all([
    catalogRepository.getBySlug(slug),
    catalogRepository.listCategories(),
  ]);
  return {
    product,
    category: product ? (categories.find((c) => c.id === product.categoryId) ?? null) : null,
  };
}

function ProductSkeleton() {
  return (
    <div role="status" aria-busy className="container-page py-6">
      <Skeleton className="mb-6 h-4 w-64" />
      <div
        className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14"
        aria-hidden
      >
        <Skeleton className="aspect-[4/5] w-full rounded-md" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-4 h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-14 w-full rounded-pill" />
        </div>
      </div>
    </div>
  );
}

function ProductLoaded({ product, category }: { product: Product; category: Category | null }) {
  const t = useTranslations('product');
  const nav = useTranslations('nav');
  const cart = useTranslations('cart');
  const format = useFormat();
  const purchase = usePurchase(product, cart('maxReached'));
  const [cta, setCta] = useState<HTMLDivElement | null>(null);
  const soldOut = isProductSoldOut(product);

  const crumbs = [
    { label: nav('home'), href: '/' },
    { label: nav('shop'), href: '/shop' },
    ...(category
      ? [{ label: format.text(category.name), href: `/category/${category.slug}` }]
      : []),
    { label: format.text(product.name) },
  ];

  return (
    <div className="container-page pt-4 pb-8">
      <Breadcrumbs items={crumbs} label={nav('breadcrumb')} />

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
        <Gallery product={product} colorHex={purchase.color.hex} priority />

        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {soldOut ? <Badge tone="dark">{t('soldOut')}</Badge> : null}
              {!soldOut && product.isNew ? <Badge tone="dark">{t('newBadge')}</Badge> : null}
              {!soldOut && !colorHasStock(purchase.color) ? (
                <Badge tone="warning">{t('soldOutColor')}</Badge>
              ) : null}
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-display">
              {format.text(product.name)}
            </h1>
            <p className="text-ink-700">{format.text(product.tagline)}</p>
            <RatingSummary rating={product.rating} count={product.reviewCount} href="#reviews" />
            <Price
              amount={product.priceEGP}
              compareAt={product.compareAtPriceEGP}
              showBadge
              className="text-xl"
            />
          </header>

          <PurchasePanel purchase={purchase} registerCta={setCta} />
          <ProductDetails product={product} />
        </div>
      </div>

      <div className="mt-20 flex flex-col gap-20">
        <ReviewsSection productId={product.id} />
        <RelatedProducts productId={product.id} />
      </div>

      <StickyBuyBar purchase={purchase} target={cta} />
    </div>
  );
}

export function ProductView({ slug }: { slug: string }) {
  const states = useTranslations('states');
  const common = useTranslations('common');
  const t = useTranslations('product');
  const state = useAsync(`product-page:${slug}`, () => loadProductPage(slug));

  if (state.status === 'loading') return <ProductSkeleton />;
  if (state.status === 'error') {
    return (
      <div className="container-page py-12">
        <ErrorState
          title={states('errorTitle')}
          body={states('errorBody')}
          retryLabel={common('retry')}
          onRetry={state.retry}
        />
      </div>
    );
  }
  const { product, category } = state.data;
  if (!product) {
    return (
      <div className="container-page py-12">
        <EmptyState
          title={t('notFoundTitle')}
          body={t('notFoundBody')}
          action={
            <Link href="/shop" className={buttonClasses({})}>
              {t('backToShop')}
            </Link>
          }
        />
      </div>
    );
  }
  return <ProductLoaded key={product.id} product={product} category={category} />;
}

'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState } from '@/components/ui/StateBlocks';
import { toast } from '@/components/ui/toast';
import { catalogRepository } from '@/data/repository';
import { useCartStore } from '@/features/cart/cart.store';
import { ProductCard, ProductCardSkeleton } from '@/features/catalog/components/ProductCard';
import { failNext } from '@/lib/demo';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';

const SWATCHES = [
  'paper',
  'canvas',
  'sand-100',
  'sand-200',
  'sand-300',
  'ink-400',
  'ink-500',
  'ink-700',
  'ink-900',
  'accent-100',
  'accent-500',
  'accent-600',
  'accent-700',
  'success-600',
  'warning-700',
  'danger-600',
] as const;

const PAGE_SIZE = 8;

export function FoundationPreview() {
  const t = useTranslations('foundation');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const format = useFormat();
  const [query, setQuery] = useState('');
  const openDrawer = useCartStore((s) => s.openDrawer);
  const addToCart = useCartStore((s) => s.add);
  const [adding, setAdding] = useState(false);

  const products = useAsync(`catalog:${query}`, () =>
    catalogRepository.list({ q: query, pageSize: PAGE_SIZE }),
  );

  const addSample = async () => {
    setAdding(true);
    try {
      const product = await catalogRepository.getBySlug('nile-low');
      const size = product?.sizes.find((s) => s.stock > 3)?.size;
      const color = product?.colors[0];
      if (product && size && color) {
        addToCart(product, color.id, size);
        openDrawer();
      }
    } catch {
      toast.error(t('failNext'));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="container-page flex flex-col gap-20 py-12 md:py-20">
      <header className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold tracking-wide text-accent-600">{t('eyebrow')}</p>
        <h1 className="font-display text-display font-bold tracking-display">{t('title')}</h1>
        <p className="mt-6 text-lg text-ink-700">{t('lead')}</p>
        <p className="mt-3 text-sm text-ink-500">{t('fastHint')}</p>
      </header>

      <section aria-labelledby="tokens" className="flex flex-col gap-8">
        <h2 id="tokens" className="font-display text-2xl font-semibold">
          {t('tokensTitle')}
        </h2>
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {SWATCHES.map((name) => (
            <li key={name} className="flex flex-col gap-1.5">
              <span
                className="h-14 rounded-md border border-sand-200"
                style={{ backgroundColor: `var(--color-${name})` }}
              />
              <span className="text-[0.6875rem] break-all text-ink-500" dir="ltr">
                {name}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <p className="font-display text-display font-bold tracking-display">{t('typeSample')}</p>
          <p className="font-display text-3xl font-semibold">{t('typeSample')}</p>
          <p className="text-xl">{t('typeSample')}</p>
          <p className="text-base">{t('typeSample')}</p>
          <p className="text-sm text-ink-500">
            {format.price(1850)} · {format.date('2026-11-04')}
          </p>
        </div>
      </section>

      <section aria-labelledby="primitives" className="flex flex-col gap-6">
        <h2 id="primitives" className="font-display text-2xl font-semibold">
          {t('primitivesTitle')}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>{t('buttonPrimary')}</Button>
          <Button variant="secondary">{t('buttonSecondary')}</Button>
          <Button variant="ghost">{t('buttonGhost')}</Button>
          <Button disabled>{t('buttonDisabled')}</Button>
          <Button loading>{t('buttonLoading')}</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => toast.success(t('toastText'))}>
            {t('showToast')}
          </Button>
          <Button onClick={addSample} loading={adding}>
            {t('addSampleToCart')}
          </Button>
          <Button variant="ghost" onClick={openDrawer}>
            {t('openCart')}
          </Button>
        </div>
      </section>

      <section aria-labelledby="catalog" className="flex flex-col gap-6">
        <h2 id="catalog" className="font-display text-2xl font-semibold">
          {t('catalogTitle')}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex-1 sm:max-w-sm">
            <span className="sr-only">{t('searchLabel')}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="min-h-12 w-full rounded-pill border border-sand-300 bg-white px-5 text-sm placeholder:text-ink-400"
            />
          </label>
          <Button
            variant="secondary"
            onClick={products.status === 'loading' ? undefined : () => products.retry()}
          >
            {t('reload')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              failNext();
              if (products.status !== 'loading') products.retry();
            }}
          >
            {t('failNext')}
          </Button>
          {products.status === 'success' ? (
            <p className="text-sm text-ink-500" aria-live="polite">
              {t('results', {
                count: products.data.total,
                countText: format.number(products.data.total),
              })}
            </p>
          ) : null}
        </div>

        {products.status === 'loading' ? (
          <div
            role="status"
            aria-label={t('buttonLoading')}
            className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4"
          >
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.status === 'error' ? (
          <ErrorState
            title={states('errorTitle')}
            body={states('errorBody')}
            retryLabel={common('retry')}
            onRetry={products.retry}
          />
        ) : products.data.items.length === 0 ? (
          <EmptyState title={states('emptyTitle')} body={states('emptyBody')} />
        ) : (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {products.data.items.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} priority={index < 4} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

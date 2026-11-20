'use client';

import { useTranslations } from 'next-intl';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Skeleton } from '@/components/ui/Skeleton';
import type { LocaleText } from '@/data/types';
import { ProductCard } from '@/features/catalog/components/ProductCard';
import { useFormat } from '@/lib/hooks/useFormat';
import type { Loaded } from './ShopListing';
import type { ShopScope } from './shop-params';

/**
 * What the static HTML of a listing contains: the same page, minus the controls that need the
 * URL (filters, sort, search box). The real listing replaces it as soon as the script is ready,
 * with the same title, spacing and cards, so nothing jumps.
 */
export function ShopListingFallback({
  scope,
  heading,
  initial,
}: {
  scope: ShopScope;
  heading?: { name: LocaleText; blurb: LocaleText };
  initial: Loaded;
}) {
  const t = useTranslations('shop');
  const nav = useTranslations('nav');
  const format = useFormat();
  const title = heading ? format.text(heading.name) : t('title');
  const crumbs = [
    { label: nav('home'), href: '/' },
    ...(scope.kind === 'all'
      ? [{ label: t('title') }]
      : [{ label: nav('shop'), href: '/shop' }, { label: title }]),
  ];
  const { total } = initial.page;

  return (
    <div className="container-page pt-4 pb-8">
      <Breadcrumbs items={crumbs} label={nav('breadcrumb')} />
      <header className="py-6">
        <h1 className="font-display text-3xl font-semibold tracking-display">{title}</h1>
        {heading ? (
          <p className="mt-2 max-w-2xl text-ink-700">{format.text(heading.blurb)}</p>
        ) : null}
      </header>
      <div className="flex items-start gap-10">
        <div className="hidden w-64 shrink-0 flex-col gap-4 pe-2 lg:flex" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <section className="min-w-0 flex-1" aria-label={t('results')}>
          <Skeleton aria-hidden className="h-12 w-full rounded-pill" />
          <div className="mt-4 flex min-h-11 items-center justify-between gap-3">
            <p className="text-sm text-ink-700">
              {t('resultCount', { count: total, countText: format.number(total) })}
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
            {initial.page.items.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} priority={index < 2} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

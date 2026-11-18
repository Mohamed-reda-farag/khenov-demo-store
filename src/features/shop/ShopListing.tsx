'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from 'react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateBlocks';
import { catalogRepository, type CatalogPage, type SortKey } from '@/data/repository';
import type { Category, LocaleText } from '@/data/types';
import { ProductCard, ProductCardSkeleton } from '@/features/catalog/components/ProductCard';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';
import { ActiveFilters } from './ActiveFilters';
import { FilterFields } from './FilterFields';
import { FilterSheet } from './FilterSheet';
import { Pagination } from './Pagination';
import { SearchBox } from './SearchBox';
import {
  PAGE_SIZE,
  SORT_KEYS,
  activeFilterCount,
  clearFilters,
  parseShopParams,
  serializeShopParams,
  toCatalogQuery,
  withPageReset,
  type ShopScope,
  type ShopState,
} from './shop-params';

interface ShopListingProps {
  scope: ShopScope;
  /** Title and intro for /category/x and /collection/y (known at build time). */
  heading?: { name: LocaleText; blurb: LocaleText };
}

interface Loaded {
  page: CatalogPage;
  categories: Category[];
}

async function loadShop(state: ShopState, scope: ShopScope): Promise<Loaded> {
  const [page, categories] = await Promise.all([
    catalogRepository.list(toCatalogQuery(state, scope)),
    catalogRepository.listCategories(),
  ]);
  return { page, categories };
}

export function ShopListingSkeleton() {
  return (
    <div role="status" aria-busy className="container-page py-8">
      <Skeleton className="mb-8 h-10 w-56" />
      <div className="flex gap-10">
        <div className="hidden w-64 shrink-0 flex-col gap-4 lg:flex" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <Skeleton className="mb-6 h-12 w-full rounded-pill" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ShopListing({ scope, heading }: ShopListingProps) {
  const t = useTranslations('shop');
  const nav = useTranslations('nav');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const format = useFormat();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const focusResults = useRef(false);

  const queryString = searchParams.toString();
  const state = useMemo(() => parseShopParams(new URLSearchParams(queryString)), [queryString]);
  const scopeKey = scope.kind === 'all' ? 'all' : `${scope.kind}:${scope.id}`;
  // Controls follow the user instantly; the URL (and the data) catch up when the transition ends.
  const [, startTransition] = useTransition();
  const [view, setView] = useOptimistic(state);
  const requestKey = `shop:${scopeKey}:${serializeShopParams(state, scope)}`;
  const result = useAsync(requestKey, () => loadShop(state, scope));

  const loaded =
    result.status === 'success'
      ? result.data
      : result.status === 'loading'
        ? result.previous
        : undefined;
  const refreshing = result.status === 'loading' && loaded !== undefined;

  const push = (next: ShopState) => {
    const qs = serializeShopParams(next, scope);
    startTransition(() => {
      setView(next);
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };
  const update = (patch: Partial<ShopState>) => push(withPageReset({ ...view, ...patch }));
  const clearAll = () => push(withPageReset(clearFilters(view)));
  const goToPage = (page: number) => {
    focusResults.current = true;
    push({ ...view, page });
  };

  // After a page change, move focus (and the viewport) to the results heading.
  useEffect(() => {
    if (result.status === 'success' && focusResults.current) {
      focusResults.current = false;
      resultsRef.current?.focus();
      resultsRef.current?.scrollIntoView({ block: 'start' });
    }
  }, [result.status]);

  const title = heading ? format.text(heading.name) : t('title');
  const filterCount = activeFilterCount(view, scope);
  const crumbs = [
    { label: nav('home'), href: '/' },
    ...(scope.kind === 'all'
      ? [{ label: t('title') }]
      : [{ label: nav('shop'), href: '/shop' }, { label: title }]),
  ];

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
        <aside
          aria-label={t('filters')}
          className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] w-64 shrink-0 overflow-y-auto pe-2 lg:block"
        >
          {loaded ? (
            <FilterFields
              state={view}
              scope={scope}
              facets={loaded.page.facets}
              categories={loaded.categories}
              onChange={update}
            />
          ) : (
            <div className="flex flex-col gap-4" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          )}
        </aside>

        <section className="min-w-0 flex-1" aria-label={t('results')}>
          <SearchBox value={view.q} onSearch={(q) => update({ q })} />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                className="lg:hidden"
                disabled={!loaded}
                onClick={() => setSheetOpen(true)}
                aria-haspopup="dialog"
                leadingIcon={<SlidersHorizontal aria-hidden className="size-4" />}
              >
                {filterCount > 0
                  ? t('filtersWithCount', {
                      count: filterCount,
                      countText: format.number(filterCount),
                    })
                  : t('filters')}
              </Button>
              <h2
                ref={resultsRef}
                tabIndex={-1}
                aria-live="polite"
                className="text-sm text-ink-700 outline-none"
              >
                {loaded
                  ? t('resultCount', {
                      count: loaded.page.total,
                      countText: format.number(loaded.page.total),
                    })
                  : t('loadingResults')}
              </h2>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-ink-500">{t('sortBy')}</span>
              <select
                value={view.sort}
                onChange={(event) => update({ sort: event.target.value as SortKey })}
                className="h-11 rounded-pill border border-sand-300 bg-paper px-4 text-sm"
              >
                {SORT_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {t(`sort.${key}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loaded ? (
            <div className="mt-4 empty:hidden">
              <ActiveFilters
                state={view}
                scope={scope}
                facets={loaded.page.facets}
                categories={loaded.categories}
                onChange={update}
                onClearAll={clearAll}
              />
            </div>
          ) : null}

          <div className="mt-6">
            {result.status === 'loading' && !loaded ? (
              <div role="status" aria-busy>
                <span className="sr-only">{common('loading')}</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
                  {Array.from({ length: PAGE_SIZE }, (_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : null}

            {result.status === 'error' ? (
              <ErrorState
                title={states('errorTitle')}
                body={states('errorBody')}
                retryLabel={common('retry')}
                onRetry={result.retry}
              />
            ) : null}

            {result.status !== 'error' && loaded ? (
              loaded.page.total === 0 ? (
                <EmptyState
                  title={t('emptyTitle')}
                  body={t('emptyBody')}
                  action={
                    filterCount > 0 ? (
                      <Button variant="secondary" onClick={clearAll}>
                        {t('resetFilters')}
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  <ul
                    aria-busy={refreshing}
                    className={`grid grid-cols-2 gap-x-4 gap-y-8 transition-opacity dur-base md:grid-cols-3 ${
                      refreshing ? 'opacity-50' : ''
                    }`}
                  >
                    {loaded.page.items.map((product) => (
                      <li key={product.id}>
                        <ProductCard product={product} />
                      </li>
                    ))}
                  </ul>
                  <Pagination
                    page={loaded.page.page}
                    pageCount={loaded.page.pageCount}
                    onChange={goToPage}
                  />
                </>
              )
            ) : null}
          </div>
        </section>
      </div>

      {loaded ? (
        <FilterSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          applied={view}
          scope={scope}
          facets={loaded.page.facets}
          categories={loaded.categories}
          onApply={(next) => push(withPageReset(next))}
        />
      ) : null}
    </div>
  );
}

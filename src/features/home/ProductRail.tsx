'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ErrorState } from '@/components/ui/StateBlocks';
import type { Product } from '@/data/types';
import { ProductCard, ProductCardSkeleton } from '@/features/catalog/components/ProductCard';
import { Link } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';

interface ProductRailProps {
  id: string;
  title: string;
  lead: string;
  /** "View all" destination. */
  href: string;
  load: () => Promise<Product[]>;
  loadKey: string;
}

/** A titled grid of products with its own loading and error state. */
export function ProductRail({ id, title, lead, href, load, loadKey }: ProductRailProps) {
  const t = useTranslations('home');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const state = useAsync(loadKey, load);

  return (
    <section aria-labelledby={`${id}-title`}>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id={`${id}-title`} className="font-display text-2xl font-semibold">
            {title}
          </h2>
          <p className="mt-1 text-ink-700">{lead}</p>
        </div>
        <Link
          href={href}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline underline-offset-4 hover:text-accent-700"
        >
          {t('viewAll')}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>

      {state.status === 'loading' ? (
        <div role="status" aria-busy className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          <span className="sr-only">{common('loading')}</span>
          {[0, 1, 2, 3].map((i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : null}
      {state.status === 'error' ? (
        <ErrorState
          title={states('errorTitle')}
          body={states('errorBody')}
          retryLabel={common('retry')}
          onRetry={state.retry}
        />
      ) : null}
      {state.status === 'success' ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {state.data.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

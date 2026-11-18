'use client';

import { useTranslations } from 'next-intl';
import { ErrorState } from '@/components/ui/StateBlocks';
import { catalogRepository } from '@/data/repository';
import { ProductCard, ProductCardSkeleton } from '@/features/catalog/components/ProductCard';
import { useAsync } from '@/lib/hooks/useAsync';

export function RelatedProducts({ productId }: { productId: string }) {
  const t = useTranslations('product');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const state = useAsync(`related:${productId}`, () => catalogRepository.getRelated(productId, 4));

  return (
    <section aria-labelledby="related-title">
      <h2 id="related-title" className="mb-8 font-display text-2xl font-semibold">
        {t('relatedTitle')}
      </h2>
      {state.status === 'loading' ? (
        <div role="status" aria-busy className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
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

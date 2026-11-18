'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/ui/StateBlocks';
import { Skeleton } from '@/components/ui/Skeleton';
import { Stars } from '@/components/ui/Stars';
import { reviewsRepository } from '@/data/repository';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';
import type { ProductReviews } from '@/data/repository';

function ReviewsSkeleton() {
  return (
    <div role="status" aria-busy className="grid gap-8 md:grid-cols-[18rem_1fr]">
      <div className="flex flex-col gap-3" aria-hidden>
        <Skeleton className="h-12 w-24" />
        <Skeleton className="h-4 w-32" />
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      <div className="flex flex-col gap-6" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewsBody({ data }: { data: ProductReviews }) {
  const t = useTranslations('reviews');
  const format = useFormat();
  const { summary, samples } = data;
  const max = Math.max(...summary.distribution.map((b) => b.count), 1);

  return (
    <div className="grid gap-10 md:grid-cols-[18rem_1fr]">
      <div>
        <p className="text-5xl font-display font-semibold">{format.rating(summary.average)}</p>
        <div className="mt-2 flex items-center gap-2">
          <Stars value={summary.average} className="size-5" />
        </div>
        <p className="mt-1 text-sm text-ink-500">
          {t('basedOn', { count: summary.count, countText: format.number(summary.count) })}
        </p>
        <ul className="mt-5 flex flex-col gap-1" aria-label={t('distribution')}>
          {summary.distribution.map((bucket) => (
            <li key={bucket.star} className="flex items-center gap-3 text-sm">
              <span className="w-20 shrink-0 text-ink-700">
                {t('starsLabel', { count: bucket.star, countText: format.number(bucket.star) })}
              </span>
              <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-pill bg-sand-100">
                <span
                  className="block h-full rounded-pill bg-accent-500"
                  style={{ width: `${(bucket.count / max) * 100}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-end text-ink-500 tabular-nums">
                {format.number(bucket.count)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-4 rounded-md bg-sand-100 px-4 py-3 text-sm text-ink-700">{t('notice')}</p>
        <ul className="divide-y divide-sand-200">
          {samples.map((review) => (
            <li key={review.id} className="py-5 first:pt-0">
              <article className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    role="img"
                    aria-label={t('ratingOf', { rating: format.number(review.rating) })}
                  >
                    <Stars value={review.rating} />
                  </span>
                  <Badge>{t('sampleBadge')}</Badge>
                </div>
                <h3 className="font-display font-semibold">{format.text(review.title)}</h3>
                <p className="text-sm text-ink-700">{format.text(review.body)}</p>
                <p className="text-xs text-ink-500">
                  {format.text(review.author)} · {format.date(review.date)}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ReviewsSection({ productId }: { productId: string }) {
  const t = useTranslations('reviews');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const state = useAsync(`reviews:${productId}`, () => reviewsRepository.forProduct(productId));

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-24">
      <h2 id="reviews-title" className="mb-8 font-display text-2xl font-semibold">
        {t('title')}
      </h2>
      {state.status === 'loading' ? <ReviewsSkeleton /> : null}
      {state.status === 'error' ? (
        <ErrorState
          title={states('errorTitle')}
          body={states('errorBody')}
          retryLabel={common('retry')}
          onRetry={state.retry}
        />
      ) : null}
      {state.status === 'success' ? <ReviewsBody data={state.data} /> : null}
    </section>
  );
}

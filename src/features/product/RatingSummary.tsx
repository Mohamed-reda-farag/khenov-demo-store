'use client';

import { useTranslations } from 'next-intl';
import { Stars } from '@/components/ui/Stars';
import { useFormat } from '@/lib/hooks/useFormat';

/** Stars + the rating as text. The label spells it out for screen readers. */
export function RatingSummary({
  rating,
  count,
  href,
}: {
  rating: number;
  count: number;
  href?: string;
}) {
  const t = useTranslations('product');
  const format = useFormat();
  const label = t('ratingLabel', {
    rating: format.rating(rating),
    countText: format.number(count),
  });
  const content = (
    <>
      <Stars value={rating} />
      <span className="font-medium text-ink-900">{format.rating(rating)}</span>
      <span>({format.number(count)})</span>
    </>
  );
  const className = 'inline-flex min-h-11 items-center gap-2 text-sm text-ink-500';
  return href ? (
    <a href={href} aria-label={label} className={`${className} hover:text-ink-900`}>
      {content}
    </a>
  ) : (
    <span aria-label={label} role="img" className={className}>
      {content}
    </span>
  );
}

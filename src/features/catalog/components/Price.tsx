'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { useFormat } from '@/lib/hooks/useFormat';

interface PriceProps {
  amount: number;
  compareAt?: number | undefined;
  className?: string;
  showBadge?: boolean;
}

export function Price({ amount, compareAt, className = '', showBadge = false }: PriceProps) {
  const format = useFormat();
  const t = useTranslations('product');
  const percent = format.discount(amount, compareAt);

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span className="font-semibold">{format.price(amount)}</span>
      {percent > 0 && compareAt ? (
        <>
          <s className="font-normal text-sm text-ink-500">{format.price(compareAt)}</s>
          {showBadge ? (
            <Badge tone="accent">{t('discountBadge', { percent: format.percent(percent) })}</Badge>
          ) : null}
        </>
      ) : null}
    </span>
  );
}

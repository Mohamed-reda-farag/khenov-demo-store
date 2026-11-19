'use client';

import { useTranslations } from 'next-intl';
import { amountToFreeShipping, FREE_SHIPPING_THRESHOLD } from '@/data/rules/shipping';
import type { PromoResult } from '@/data/rules/promo';
import type { Totals } from '@/data/rules/totals';
import type { ShippingMethodId } from '@/data/types';
import { useFormat } from '@/lib/hooks/useFormat';

interface OrderSummaryRowsProps {
  totals: Totals;
  promo: PromoResult | null;
  /** Shown beside the shipping line, e.g. "Standard". */
  shippingLabel?: string;
}

/** Subtotal, discount, shipping and total, in that order. */
export function OrderSummaryRows({ totals, promo, shippingLabel }: OrderSummaryRowsProps) {
  const t = useTranslations('cart');
  const format = useFormat();
  const code = promo?.ok ? promo.promo.code : null;
  return (
    <dl className="flex flex-col gap-2 text-sm">
      <div className="flex justify-between gap-4">
        <dt className="text-ink-700">{t('subtotal')}</dt>
        <dd>{format.price(totals.subtotal)}</dd>
      </div>
      {totals.discount > 0 && code ? (
        <div className="flex justify-between gap-4 text-success-600">
          <dt>
            {t('discount')} (<bdi dir="ltr">{code}</bdi>)
          </dt>
          <dd>−{format.price(totals.discount)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between gap-4">
        <dt className="text-ink-700">
          {t('shipping')}
          {shippingLabel ? <span className="text-ink-500"> · {shippingLabel}</span> : null}
        </dt>
        <dd>{totals.freeShipping ? t('shippingFree') : format.price(totals.shipping)}</dd>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-sand-200 pt-4">
        <dt className="font-medium">{t('total')}</dt>
        <dd className="font-display text-xl font-semibold">{format.price(totals.total)}</dd>
      </div>
    </dl>
  );
}

/** How far the cart is from free standard shipping. Moves with transform only. */
export function FreeShippingProgress({
  subtotal,
  method,
  freeByPromo,
}: {
  subtotal: number;
  method: ShippingMethodId;
  freeByPromo: boolean;
}) {
  const t = useTranslations('cart');
  const format = useFormat();
  if (method !== 'standard' || freeByPromo || subtotal <= 0) return null;
  const remaining = amountToFreeShipping(subtotal);
  const progress = Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD);
  return (
    <div role="status" className="flex flex-col gap-2 text-sm">
      <p>
        {remaining > 0
          ? t('freeShippingRemaining', { amount: format.price(remaining) })
          : t('freeShippingReached')}
      </p>
      <div aria-hidden className="h-1.5 overflow-hidden rounded-pill bg-sand-200">
        <div
          className="h-full origin-left rounded-pill bg-accent-600 transition-transform dur-slow ease-brand rtl:origin-right"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  );
}

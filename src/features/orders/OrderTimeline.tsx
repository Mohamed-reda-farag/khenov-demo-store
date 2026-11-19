'use client';

import { Check, PackageCheck, PackageOpen, Receipt, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  orderStatus,
  stepTime,
  TIMELINE_STEPS,
  type TimelineStep,
} from '@/data/rules/order-status';
import type { Order } from '@/data/types';
import { useFormat } from '@/lib/hooks/useFormat';

const ICONS = {
  placed: Receipt,
  processing: PackageOpen,
  shipped: Truck,
  delivered: PackageCheck,
} as const;

/**
 * placed → processing → shipped → delivered. Vertical on phones, horizontal from `sm`;
 * in Arabic the row runs right to left on its own, because it is plain flex content.
 */
export function OrderTimeline({ order, now }: { order: Order; now: Date }) {
  const t = useTranslations('orders');
  const format = useFormat();
  const status = orderStatus(order, now);
  const currentIndex = TIMELINE_STEPS.indexOf(status as TimelineStep);

  return (
    <ol className="flex flex-col gap-0 sm:flex-row" aria-label={t('timelineLabel')}>
      {TIMELINE_STEPS.map((step, index) => {
        const reached = index <= currentIndex;
        const current = index === currentIndex;
        const Icon = ICONS[step];
        const last = index === TIMELINE_STEPS.length - 1;
        return (
          <li
            key={step}
            aria-current={current ? 'step' : undefined}
            className="relative flex gap-4 pb-8 last:pb-0 sm:flex-1 sm:flex-col sm:gap-3 sm:pb-0"
          >
            {last ? null : (
              <span
                aria-hidden
                className={`absolute start-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 sm:start-12 sm:top-5 sm:h-0.5 sm:w-[calc(100%-3.5rem)] ${
                  index < currentIndex ? 'bg-success-600' : 'bg-sand-300'
                }`}
              />
            )}
            <span
              className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full ${
                reached ? 'bg-success-600 text-white' : 'bg-sand-100 text-ink-500'
              } ${current && step !== 'delivered' ? 'ring-4 ring-success-100' : ''}`}
            >
              {reached && !current ? (
                <Check aria-hidden className="size-5" />
              ) : (
                <Icon aria-hidden className="size-5" />
              )}
            </span>
            <span className="flex flex-col pt-1 sm:pt-0">
              <span className={`font-medium ${reached ? '' : 'text-ink-500'}`}>
                {t(`status.${step}`)}
              </span>
              <span className="text-sm text-ink-500">
                {reached || step === 'placed'
                  ? format.date(stepTime(order, step), { hour: 'numeric', minute: '2-digit' })
                  : t(`pending.${step}`)}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

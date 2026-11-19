'use client';

import { ChevronRight, PackageSearch } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { buttonClasses } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateBlocks';
import { photoColorFor } from '@/data/images';
import { ordersRepository } from '@/data/repository';
import { orderStatus } from '@/data/rules/order-status';
import { ProductImage } from '@/features/catalog/components/ProductImage';
import { Link } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';
import { useNow } from '@/lib/hooks/useNow';
import { OrderStatusBadge } from './OrderStatusBadge';

export function OrdersList() {
  const t = useTranslations('orders');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const format = useFormat();
  const now = useNow(5_000);
  const state = useAsync('orders-list', () => ordersRepository.list());

  if (state.status === 'loading') {
    return (
      <div role="status" aria-busy className="flex flex-col gap-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <ErrorState
        title={states('errorTitle')}
        body={states('errorBody')}
        retryLabel={common('retry')}
        onRetry={state.retry}
      />
    );
  }
  if (state.data.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch aria-hidden className="size-7" />}
        title={t('emptyTitle')}
        body={t('emptyBody')}
        action={
          <Link href="/shop" className={buttonClasses({})}>
            {t('emptyCta')}
          </Link>
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {state.data.map((order) => {
        const items = order.lines.reduce((sum, l) => sum + l.quantity, 0);
        return (
          <li key={order.id}>
            <Link
              href={`/order?id=${order.id}`}
              className="hover:bg-sand-50 flex items-center gap-4 rounded-lg border border-sand-200 p-4"
            >
              <div className="flex -space-x-3 rtl:space-x-reverse">
                {order.lines.slice(0, 3).map((line) => (
                  <div key={line.id} className="w-14 overflow-hidden rounded-md ring-2 ring-paper">
                    <ProductImage
                      slug={line.slug}
                      categoryId={line.categoryId}
                      alt=""
                      colorHex={line.colorHex}
                      colorId={photoColorFor(line.slug, line.colorId)}
                      sizes="56px"
                    />
                  </div>
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <bdi dir="ltr" className="font-display font-semibold">
                    {order.id}
                  </bdi>
                  <OrderStatusBadge status={orderStatus(order, now)} />
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {format.date(order.createdAt)} ·{' '}
                  {t('itemCount', { count: items, countText: format.number(items) })} ·{' '}
                  {format.price(order.totals.total)}
                </p>
              </div>
              <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-500 rtl:rotate-180" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

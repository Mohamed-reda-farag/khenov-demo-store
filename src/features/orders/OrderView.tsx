'use client';

import { CheckCircle2, PackageSearch, RotateCcw, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateBlocks';
import { toast } from '@/components/ui/toast';
import { governorateName } from '@/data/governorates';
import { photoColorFor } from '@/data/images';
import { catalogRepository, ordersRepository } from '@/data/repository';
import { normalizeOrderId } from '@/data/rules/order-id';
import { canCancel, orderStatus } from '@/data/rules/order-status';
import { OrderError } from '@/data/rules/place-order';
import { estimateDelivery } from '@/data/rules/shipping';
import type { Order } from '@/data/types';
import { reorderLines } from '@/features/cart/cart.logic';
import { useCartStore } from '@/features/cart/cart.store';
import { OrderSummaryRows } from '@/features/cart/OrderSummary';
import { ProductImage } from '@/features/catalog/components/ProductImage';
import { Link, useRouter } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';
import { useNow } from '@/lib/hooks/useNow';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderTimeline } from './OrderTimeline';

export function OrderSkeleton() {
  return (
    <div role="status" aria-busy className="container-page max-w-4xl py-10">
      <Skeleton className="mb-3 h-9 w-72" />
      <Skeleton className="mb-10 h-5 w-48" />
      <div aria-hidden className="flex flex-col gap-6">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-sand-200 p-5 sm:p-6">
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function OrderLoaded({ initial, placed }: { initial: Order; placed: boolean }) {
  const t = useTranslations('orders');
  const cart = useTranslations('cart');
  const checkout = useTranslations('checkout');
  const format = useFormat();
  const router = useRouter();
  const now = useNow(5_000);
  const addMany = useCartStore((s) => s.addMany);
  const [order, setOrder] = useState(initial);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);

  const status = orderStatus(order, now);
  const cancellable = canCancel(order, now);
  const items = order.lines.reduce((sum, l) => sum + l.quantity, 0);
  const estimate = estimateDelivery(order.shippingMethod, new Date(order.createdAt));
  const gov = governorateName(order.shipping.governorate);

  const undoCancel = async () => {
    try {
      setOrder(await ordersRepository.undoCancel(order.id));
      toast.success(t('cancelUndone'));
    } catch {
      toast.show({ message: t('undoFailed'), tone: 'error' });
    }
  };

  const confirmCancel = async () => {
    setCancelling(true);
    try {
      setOrder(await ordersRepository.cancel(order.id));
      setConfirming(false);
      toast.show({
        message: t('cancelled', { id: order.id }),
        action: { label: t('undo'), onAction: () => void undoCancel() },
        durationMs: 9000,
      });
    } catch (error) {
      setConfirming(false);
      const notAllowed = error instanceof OrderError && error.code === 'NOT_CANCELLABLE';
      toast.show({
        message: notAllowed ? t('cancelNotAllowed') : t('cancelFailed'),
        tone: 'error',
      });
    } finally {
      setCancelling(false);
    }
  };

  const reorder = async () => {
    setReordering(true);
    try {
      const products = await catalogRepository.getByIds(order.lines.map((l) => l.productId));
      const { lines, skipped } = reorderLines(order.lines, products);
      const added = addMany(lines);
      if (added === 0) {
        toast.show({ message: t('reorderNone'), tone: 'error' });
        return;
      }
      toast.success(
        skipped.length > 0
          ? t('reorderPartial', { skipped: format.number(skipped.length) })
          : t('reorderDone'),
      );
      router.push('/cart');
    } catch {
      toast.show({ message: t('reorderFailed'), tone: 'error' });
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="container-page max-w-4xl py-8 sm:py-12">
      {placed ? (
        <div
          role="status"
          className="mb-8 flex items-start gap-4 rounded-lg bg-success-100 p-5 sm:p-6"
        >
          <CheckCircle2 aria-hidden className="mt-1 size-7 shrink-0 text-success-600" />
          <div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">{t('thanksTitle')}</h1>
            <p className="mt-1 text-ink-700">{t('thanksBody', { email: order.contact.email })}</p>
          </div>
        </div>
      ) : null}

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          {placed ? null : (
            <h1 className="font-display text-3xl font-semibold">{t('detailTitle')}</h1>
          )}
          <p className={`flex flex-wrap items-center gap-3 ${placed ? 'text-lg' : 'mt-2'}`}>
            <span className="text-ink-500">{t('orderNumber')}</span>
            <bdi dir="ltr" className="font-display font-semibold">
              {order.id}
            </bdi>
            <OrderStatusBadge status={status} />
          </p>
          <p className="mt-1 text-sm text-ink-500">
            {t('placedOn', {
              date: format.date(order.createdAt, { dateStyle: 'long', timeStyle: 'short' }),
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void reorder()} loading={reordering}>
            <RotateCcw aria-hidden className="size-4" />
            {t('reorder')}
          </Button>
          {cancellable ? (
            <Button variant="danger" onClick={() => setConfirming(true)}>
              {t('cancelOrder')}
            </Button>
          ) : null}
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {status === 'cancelled' ? (
          <div role="status" className="flex items-start gap-3 rounded-lg bg-danger-100 p-5">
            <XCircle aria-hidden className="mt-0.5 size-6 shrink-0 text-danger-600" />
            <div>
              <p className="font-semibold text-danger-600">{t('cancelledTitle')}</p>
              <p className="text-sm text-ink-700">
                {t('cancelledBody', {
                  date: format.date(order.cancelledAt ?? order.createdAt, {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  }),
                })}
              </p>
            </div>
          </div>
        ) : (
          <Card title={t('statusTitle')}>
            <OrderTimeline order={order} now={now} />
            <p className="mt-5 text-sm text-ink-500">
              {t('simulatedNote')}{' '}
              {status === 'placed'
                ? t('cancelLater')
                : status === 'processing'
                  ? t('cancelNow')
                  : status === 'shipped' || status === 'delivered'
                    ? t('cancelTooLate')
                    : ''}
            </p>
          </Card>
        )}

        <Card title={t('itemsTitle', { count: items, countText: format.number(items) })}>
          <ul className="divide-y divide-sand-200">
            {order.lines.map((line) => (
              <li key={line.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <Link
                  href={`/product/${line.slug}?color=${line.colorId}`}
                  aria-hidden
                  tabIndex={-1}
                  className="w-20 shrink-0"
                >
                  <ProductImage
                    slug={line.slug}
                    categoryId={line.categoryId}
                    alt=""
                    colorHex={line.colorHex}
                    colorId={photoColorFor(line.slug, line.colorId)}
                    sizes="80px"
                    className="rounded-md"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <Link
                    href={`/product/${line.slug}?color=${line.colorId}`}
                    className="truncate font-display font-medium underline-offset-4 hover:underline"
                  >
                    {format.text(line.name)}
                  </Link>
                  <p className="text-sm text-ink-500">
                    {cart('size')} {format.number(line.size)} · {format.text(line.colorName)} ·{' '}
                    {t('quantityShort', { quantity: format.number(line.quantity) })}
                  </p>
                </div>
                <span className="self-center font-medium">
                  {format.price(line.unitPriceEGP * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-sand-200 pt-5">
            <OrderSummaryRows
              totals={{
                ...order.totals,
                freeShipping: order.totals.subtotal > 0 && order.totals.shipping === 0,
              }}
              promo={
                order.promoCode
                  ? {
                      ok: true,
                      promo: {
                        code: order.promoCode,
                        kind: 'fixed',
                        value: order.totals.discount,
                        description: { ar: '', en: '' },
                      },
                      discount: order.totals.discount,
                      freeShipping: false,
                    }
                  : null
              }
              shippingLabel={checkout(`method.${order.shippingMethod}`)}
            />
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title={t('deliveryTitle')}>
            <address className="flex flex-col gap-1 text-sm not-italic">
              <span className="font-medium">{order.shipping.fullName}</span>
              <span>
                {format.list([
                  order.shipping.street,
                  order.shipping.city,
                  gov ? format.text(gov) : order.shipping.governorate,
                ])}
              </span>
              <bdi dir="ltr" className="self-start">
                {order.contact.phone}
              </bdi>
              {order.shipping.notes ? (
                <span className="text-ink-500">{order.shipping.notes}</span>
              ) : null}
            </address>
            <p className="mt-4 text-sm text-ink-500">
              {checkout(`method.${order.shippingMethod}`)} ·{' '}
              {checkout('estimate', {
                from: format.date(estimate.from, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                }),
                to: format.date(estimate.to, { weekday: 'short', day: 'numeric', month: 'short' }),
              })}
            </p>
          </Card>
          <Card title={t('paymentTitle')}>
            <p className="text-sm">
              {order.paymentMethod === 'card' ? t('paidByCard') : t('paidOnDelivery')}
            </p>
            <p className="mt-2 text-sm text-ink-500">{t('demoPaymentNote')}</p>
            <p className="mt-4 text-sm">
              <bdi dir="ltr">{order.contact.email}</bdi>
            </p>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/shop" className={buttonClasses({ variant: 'secondary' })}>
            {t('continueShopping')}
          </Link>
          <Link href="/account" className={buttonClasses({ variant: 'ghost' })}>
            {t('allOrders')}
          </Link>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        title={t('cancelConfirmTitle')}
        description={t('cancelConfirmBody', { id: order.id })}
        confirmLabel={t('cancelConfirmYes')}
        cancelLabel={t('cancelConfirmNo')}
        tone="danger"
        pending={cancelling}
        onConfirm={() => void confirmCancel()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}

/** Confirmation page and order detail in one: the order id comes from `?id=`, `placed=1` adds the thank-you banner. */
export function OrderView() {
  const t = useTranslations('orders');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const params = useSearchParams();
  const id = normalizeOrderId(params.get('id') ?? '');
  const placed = params.get('placed') === '1';
  const state = useAsync(`order:${id ?? 'none'}`, async () =>
    id ? ordersRepository.get(id) : null,
  );

  if (state.status === 'loading') return <OrderSkeleton />;
  if (state.status === 'error') {
    return (
      <div className="container-page py-12">
        <ErrorState
          title={states('errorTitle')}
          body={states('errorBody')}
          retryLabel={common('retry')}
          onRetry={state.retry}
        />
      </div>
    );
  }
  if (!state.data) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<PackageSearch aria-hidden className="size-7" />}
          title={t('notFoundTitle')}
          body={t('notFoundBody')}
          action={
            <Link href="/account" className={buttonClasses({})}>
              {t('allOrders')}
            </Link>
          }
        />
      </div>
    );
  }
  return <OrderLoaded key={state.data.id} initial={state.data} placed={placed} />;
}

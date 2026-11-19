'use client';

import { AlertTriangle, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/StateBlocks';
import { isBlocking } from '@/data/rules/line-check';
import { Link } from '@/i18n/navigation';
import { useFormat } from '@/lib/hooks/useFormat';
import { CartLineItem } from './CartLineItem';
import { FreeShippingProgress, OrderSummaryRows } from './OrderSummary';
import { PromoBox } from './PromoBox';
import { useCartStore } from './cart.store';
import { useCartCheck } from './useCartCheck';
import { useCartPricing } from './useCartPricing';

export function CartSkeleton() {
  return (
    <div role="status" aria-busy className="container-page py-8">
      <Skeleton className="mb-8 h-9 w-48" />
      <div aria-hidden className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex flex-col gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="aspect-[4/5] w-28 rounded-md" />
              <div className="flex flex-1 flex-col gap-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="mt-auto h-11 w-32 rounded-pill" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function CartView() {
  const t = useTranslations('cart');
  const format = useFormat();
  const hydrated = useCartStore((s) => s.hydrated);
  const lines = useCartStore((s) => s.lines);
  const check = useCartCheck(lines);
  const pricing = useCartPricing('standard');

  if (!hydrated) return <CartSkeleton />;

  if (lines.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<ShoppingBag aria-hidden className="size-7" />}
          title={t('emptyTitle')}
          body={t('emptyBody')}
          action={
            <Link href="/shop" className={buttonClasses({})}>
              {t('emptyCta')}
            </Link>
          }
        />
      </div>
    );
  }

  const blocked = check.issues.some(isBlocking);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl font-semibold">{t('title')}</h1>
        <p className="text-ink-500">{t('itemCount', { count, countText: format.number(count) })}</p>
      </header>

      {check.status === 'error' ? (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center gap-3 rounded-md bg-warning-100 p-4 text-sm text-warning-700"
        >
          <AlertTriangle aria-hidden className="size-5 shrink-0" />
          <p className="flex-1 font-medium">{t('checkFailed')}</p>
          <Button variant="secondary" onClick={check.retry}>
            {t('checkRetry')}
          </Button>
        </div>
      ) : null}

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section aria-label={t('items')}>
          <p className="sr-only" aria-live="polite">
            {check.status === 'loading' ? t('checking') : ''}
          </p>
          <ul className="divide-y divide-sand-200 border-y border-sand-200">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} issues={check.issues} variant="page" />
            ))}
          </ul>
          <Link
            href="/shop"
            className="mt-4 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4"
          >
            {t('continueShopping')}
          </Link>
        </section>

        <aside
          aria-label={t('summary')}
          className="bg-sand-50 flex flex-col gap-6 rounded-lg border border-sand-200 p-6 lg:sticky lg:top-28"
        >
          <h2 className="font-display text-xl font-semibold">{t('summary')}</h2>
          <FreeShippingProgress
            subtotal={pricing.subtotal}
            method="standard"
            freeByPromo={pricing.promo?.ok === true && pricing.promo.freeShipping}
          />
          <PromoBox subtotal={pricing.subtotal} result={pricing.promo} />
          <OrderSummaryRows
            totals={pricing.totals}
            promo={pricing.promo}
            shippingLabel={t('standardDelivery')}
          />
          <p className="text-xs text-ink-500">{t('shippingNote')}</p>
          {blocked ? (
            <>
              <p id="cart-blocked" role="status" className="text-sm font-medium text-danger-600">
                {t('fixItems')}
              </p>
              <Button size="lg" fullWidth disabled aria-describedby="cart-blocked">
                {t('checkout')}
              </Button>
            </>
          ) : (
            <Link href="/checkout" className={buttonClasses({ size: 'lg', fullWidth: true })}>
              {t('checkout')}
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { buttonClasses } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { toast } from '@/components/ui/toast';
import { isBlocking } from '@/data/rules/line-check';
import { Link } from '@/i18n/navigation';
import { useFormat } from '@/lib/hooks/useFormat';
import { subtotal } from './cart.logic';
import { CartLineItem } from './CartLineItem';
import { useCartStore } from './cart.store';
import { useCartCheck } from './useCartCheck';

const NOTICE_MS = 8000;

/** Shown at the top of the drawer right after an add, with Undo. */
function AddedNotice() {
  const t = useTranslations('cart');
  const format = useFormat();
  const lastAdded = useCartStore((s) => s.lastAdded);
  const undoAdd = useCartStore((s) => s.undoAdd);
  const clear = useCartStore((s) => s.clearLastAdded);
  const token = lastAdded?.token;

  useEffect(() => {
    if (token === undefined) return;
    const timer = setTimeout(clear, NOTICE_MS);
    return () => clearTimeout(timer);
  }, [token, clear]);

  if (!lastAdded) return null;
  const { line } = lastAdded;
  const name = format.text(line.name);
  return (
    <div
      role="status"
      className="mx-6 mt-4 flex items-start gap-3 rounded-md bg-success-100 p-4 text-sm text-ink-900"
    >
      <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-success-600" />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{t('added', { name })}</p>
        <p className="text-ink-700">
          {t('addedDetail', {
            color: format.text(line.colorName),
            size: format.number(line.size),
            quantity: format.number(line.quantity),
          })}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          undoAdd();
          toast.success(t('addUndone'));
        }}
        className="inline-flex min-h-11 shrink-0 items-center px-2 font-semibold underline underline-offset-4"
      >
        {t('undo')}
      </button>
    </div>
  );
}

export function CartDrawer() {
  const t = useTranslations('cart');
  const format = useFormat();
  const open = useCartStore((s) => s.drawerOpen);
  const close = useCartStore((s) => s.closeDrawer);
  const lines = useCartStore((s) => s.lines);
  const check = useCartCheck(lines);
  const blocked = check.issues.some(isBlocking);

  const footer =
    lines.length > 0 ? (
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-ink-700">{t('subtotal')}</span>
          <span className="font-display text-xl font-semibold">
            {format.price(subtotal(lines))}
          </span>
        </div>
        <p className="text-xs text-ink-500">{t('shippingNote')}</p>
        {blocked ? <p className="text-sm font-medium text-warning-700">{t('fixItems')}</p> : null}
        <Link
          href={blocked ? '/cart' : '/checkout'}
          onClick={close}
          className={buttonClasses({ size: 'lg', fullWidth: true })}
        >
          {blocked ? t('reviewCart') : t('checkout')}
        </Link>
        {blocked ? null : (
          <Link
            href="/cart"
            onClick={close}
            className={buttonClasses({ variant: 'secondary', fullWidth: true })}
          >
            {t('viewCart')}
          </Link>
        )}
      </div>
    ) : undefined;

  return (
    <Drawer open={open} onClose={close} title={t('title')} footer={footer}>
      <AddedNotice />
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center">
          <h3 className="font-display text-xl font-semibold">{t('emptyTitle')}</h3>
          <p className="text-sm text-ink-500">{t('emptyBody')}</p>
          <Link href="/shop" onClick={close} className={buttonClasses({})}>
            {t('emptyCta')}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-sand-200 px-6">
          {lines.map((line) => (
            <CartLineItem
              key={line.id}
              line={line}
              issues={check.issues}
              variant="drawer"
              onNavigate={close}
            />
          ))}
        </ul>
      )}
    </Drawer>
  );
}

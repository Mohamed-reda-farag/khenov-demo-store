'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { buttonClasses } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { IconButton } from '@/components/ui/IconButton';
import { toast } from '@/components/ui/toast';
import type { CartLine } from '@/data/types';
import { ProductImage } from '@/features/catalog/components/ProductImage';
import { Link } from '@/i18n/navigation';
import { useFormat } from '@/lib/hooks/useFormat';
import { subtotal } from './cart.logic';
import { useCartStore } from './cart.store';

function CartLineRow({ line }: { line: CartLine }) {
  const t = useTranslations('cart');
  const format = useFormat();
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const restore = useCartStore((s) => s.restore);
  const name = format.text(line.name);

  const onRemove = () => {
    const removed = remove(line.id);
    if (!removed) return;
    toast.show({
      message: t('removed', { name }),
      action: {
        label: t('undo'),
        onAction: () => {
          restore(removed.line, removed.index);
          toast.success(t('restored', { name }));
        },
      },
    });
  };

  return (
    <li className="flex gap-4 py-4">
      <ProductImage
        slug={line.slug}
        categoryId={line.categoryId}
        alt={name}
        colorHex={line.colorHex}
        sizes="96px"
        className="w-24 shrink-0 rounded-md"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display font-medium">{name}</p>
            <p className="mt-0.5 text-sm text-ink-500">
              {t('size')} {format.number(line.size)} · {format.text(line.colorName)}
            </p>
          </div>
          <IconButton label={t('remove', { name })} onClick={onRemove} className="-me-2 -mt-2">
            <Trash2 aria-hidden className="size-4" />
          </IconButton>
        </div>
        <div className="flex items-center justify-between">
          <div
            role="group"
            aria-label={t('quantity')}
            className="flex items-center rounded-pill border border-sand-300"
          >
            <IconButton
              label={t('decrease')}
              disabled={line.quantity <= 1}
              onClick={() => setQuantity(line.id, line.quantity - 1)}
            >
              <Minus aria-hidden className="size-4" />
            </IconButton>
            <span aria-live="polite" className="min-w-6 text-center text-sm font-medium">
              {format.number(line.quantity)}
            </span>
            <IconButton
              label={t('increase')}
              disabled={line.quantity >= line.maxQuantity}
              onClick={() => setQuantity(line.id, line.quantity + 1)}
            >
              <Plus aria-hidden className="size-4" />
            </IconButton>
          </div>
          <span className="font-semibold">{format.price(line.unitPriceEGP * line.quantity)}</span>
        </div>
      </div>
    </li>
  );
}

export function CartDrawer() {
  const t = useTranslations('cart');
  const format = useFormat();
  const open = useCartStore((s) => s.drawerOpen);
  const close = useCartStore((s) => s.closeDrawer);
  const lines = useCartStore((s) => s.lines);

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
        <Link
          href="/checkout"
          onClick={close}
          className={buttonClasses({ size: 'lg', fullWidth: true })}
        >
          {t('checkout')}
        </Link>
        <Link
          href="/cart"
          onClick={close}
          className={buttonClasses({ variant: 'secondary', fullWidth: true })}
        >
          {t('viewCart')}
        </Link>
      </div>
    ) : undefined;

  return (
    <Drawer open={open} onClose={close} title={t('title')} footer={footer}>
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
            <CartLineRow key={line.id} line={line} />
          ))}
        </ul>
      )}
    </Drawer>
  );
}

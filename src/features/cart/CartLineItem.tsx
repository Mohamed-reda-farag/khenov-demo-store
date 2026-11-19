'use client';

import { Heart, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { IconButton } from '@/components/ui/IconButton';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { toast } from '@/components/ui/toast';
import { photoColorFor } from '@/data/images';
import { MAX_PER_LINE } from '@/data/limits';
import { issuesFor, type LineIssue } from '@/data/rules/line-check';
import type { CartLine } from '@/data/types';
import { ProductImage } from '@/features/catalog/components/ProductImage';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';
import { Link } from '@/i18n/navigation';
import { useFormat } from '@/lib/hooks/useFormat';
import { useCartStore } from './cart.store';

interface CartLineItemProps {
  line: CartLine;
  issues: readonly LineIssue[];
  /** 'page' adds "Move to wishlist" and a larger photo. */
  variant: 'drawer' | 'page';
  /** Called when the visitor follows the product link (the drawer closes itself). */
  onNavigate?: () => void;
}

/** One cart line, used by both the cart page and the mini-cart drawer so they always agree. */
export function CartLineItem({ line, issues, variant, onNavigate }: CartLineItemProps) {
  const t = useTranslations('cart');
  const format = useFormat();
  const setQuantity = useCartStore((s) => s.setQuantity);
  const refresh = useCartStore((s) => s.refresh);
  const remove = useCartStore((s) => s.remove);
  const restore = useCartStore((s) => s.restore);
  const name = format.text(line.name);
  const mine = issuesFor(issues, line.id);
  const unavailable = mine.some((i) => i.kind === 'unavailable');
  const shortage = mine.find((i) => i.kind === 'insufficient');
  const priceChange = mine.find((i) => i.kind === 'price-changed');

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

  const onMoveToWishlist = () => {
    const wishlist = useWishlistStore.getState();
    const added = wishlist.add(line.productId, line.colorId);
    const removed = remove(line.id);
    if (!removed) return;
    toast.show({
      message: t('movedToWishlist', { name }),
      action: {
        label: t('undo'),
        onAction: () => {
          restore(removed.line, removed.index);
          if (added) useWishlistStore.getState().remove(line.productId);
          toast.success(t('restored', { name }));
        },
      },
    });
  };

  const atLimit = !unavailable && line.quantity >= line.maxQuantity;
  const limitText =
    line.maxQuantity >= MAX_PER_LINE
      ? t('limitCap', { max: format.number(MAX_PER_LINE) })
      : t('limitStock', { count: line.maxQuantity, countText: format.number(line.maxQuantity) });

  const photoColor = photoColorFor(line.slug, line.colorId);
  const imageClass = variant === 'page' ? 'w-28 sm:w-32' : 'w-24';

  return (
    <li className="flex gap-4 py-5">
      <Link
        href={`/product/${line.slug}?color=${line.colorId}`}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden
        className={`${imageClass} shrink-0`}
      >
        <ProductImage
          slug={line.slug}
          categoryId={line.categoryId}
          alt=""
          colorHex={line.colorHex}
          colorId={photoColor}
          sizes={variant === 'page' ? '128px' : '96px'}
          className={`rounded-md ${unavailable ? 'opacity-50' : ''}`}
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/product/${line.slug}?color=${line.colorId}`}
              onClick={onNavigate}
              className="block truncate font-display font-medium underline-offset-4 hover:underline"
            >
              {name}
            </Link>
            <p className="mt-0.5 text-sm text-ink-500">
              {t('size')} {format.number(line.size)} · {format.text(line.colorName)}
            </p>
            {variant === 'page' ? (
              <p className="mt-0.5 text-sm text-ink-500">{format.price(line.unitPriceEGP)}</p>
            ) : null}
          </div>
          <IconButton label={t('remove', { name })} onClick={onRemove} className="-me-2 -mt-2">
            <Trash2 aria-hidden className="size-4" />
          </IconButton>
        </div>

        {unavailable ? (
          <p
            role="status"
            className="rounded-md bg-danger-100 px-3 py-2 text-sm font-medium text-danger-600"
          >
            {t('issueUnavailable')}
          </p>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <QuantityStepper
              value={line.quantity}
              max={line.maxQuantity}
              onChange={(quantity) => setQuantity(line.id, quantity)}
            />
            <span className="font-semibold">{format.price(line.unitPriceEGP * line.quantity)}</span>
          </div>
        )}

        <div aria-live="polite" className="flex flex-col gap-2 empty:hidden">
          {atLimit && !shortage ? <p className="text-sm text-warning-700">{limitText}</p> : null}
          {shortage?.kind === 'insufficient' ? (
            <p className="flex flex-wrap items-center gap-x-3 text-sm font-medium text-warning-700">
              {t('issueInsufficient', {
                count: shortage.available,
                countText: format.number(shortage.available),
              })}
              <button
                type="button"
                onClick={() => refresh(line.id, { maxQuantity: shortage.available })}
                className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
              >
                {t('updateQuantity')}
              </button>
            </p>
          ) : null}
          {priceChange?.kind === 'price-changed' ? (
            <p className="flex flex-wrap items-center gap-x-3 text-sm font-medium text-warning-700">
              {t('issuePrice', {
                from: format.price(priceChange.from),
                to: format.price(priceChange.to),
              })}
              <button
                type="button"
                onClick={() => refresh(line.id, { unitPriceEGP: priceChange.to })}
                className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
              >
                {t('acceptPrice')}
              </button>
            </p>
          ) : null}
        </div>

        {variant === 'page' ? (
          <button
            type="button"
            onClick={onMoveToWishlist}
            className="-ms-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-pill px-2 text-sm font-medium text-ink-700 hover:bg-sand-100"
          >
            <Heart aria-hidden className="size-4" />
            {t('moveToWishlist')}
          </button>
        ) : null}
      </div>
    </li>
  );
}

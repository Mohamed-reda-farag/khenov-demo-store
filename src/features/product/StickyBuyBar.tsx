'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { colorHasStock, isProductSoldOut } from '@/data/stock';
import { Price } from '@/features/catalog/components/Price';
import { useCartStore } from '@/features/cart/cart.store';
import { useFormat } from '@/lib/hooks/useFormat';
import type { Purchase } from './usePurchase';

/** Phone-only bar that appears once the real add-to-cart button has scrolled out of view. */
export function StickyBuyBar({
  purchase,
  target,
}: {
  purchase: Purchase;
  target: HTMLDivElement | null;
}) {
  const t = useTranslations('product');
  const format = useFormat();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [visible, setVisible] = useState(false);
  const { product } = purchase;
  const unavailable = isProductSoldOut(product) || !colorHasStock(purchase.color);

  useEffect(() => {
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setVisible(!entry.isIntersecting);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [target]);

  useEffect(() => {
    const root = document.documentElement;
    if (visible) root.style.setProperty('--toast-offset', '5rem');
    return () => {
      root.style.removeProperty('--toast-offset');
    };
  }, [visible]);

  const submit = () => {
    const result = purchase.submit();
    if (result === 'needs-size') purchase.focusSizes();
    if (result === 'added' || result === 'merged') openDrawer();
  };

  return (
    <div
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-header border-t border-sand-200 bg-paper px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lift transition-transform dur-base ease-brand md:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-medium">{format.text(product.name)}</p>
          <Price
            amount={product.priceEGP}
            compareAt={product.compareAtPriceEGP}
            className="text-sm"
          />
        </div>
        <Button disabled={unavailable} onClick={submit}>
          {unavailable ? t('soldOut') : t('addToCart')}
        </Button>
      </div>
    </div>
  );
}

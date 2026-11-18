'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { buttonClasses } from '@/components/ui/Button';
import type { Product } from '@/data/types';
import { useCartStore } from '@/features/cart/cart.store';
import { Price } from '@/features/catalog/components/Price';
import { Link } from '@/i18n/navigation';
import { useFormat } from '@/lib/hooks/useFormat';
import { Gallery } from './Gallery';
import { PurchasePanel } from './PurchasePanel';
import { RatingSummary } from './RatingSummary';
import { usePurchase } from './usePurchase';

/** Lets the quick view finish fading out (and hand focus back) before the cart drawer slides in. */
const HANDOFF_MS = 280;

function QuickViewBody({ product, onClose }: { product: Product; onClose: () => void }) {
  const t = useTranslations('product');
  const cart = useTranslations('cart');
  const format = useFormat();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const purchase = usePurchase(product, cart('maxReached'));

  return (
    <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-8">
      <Gallery product={product} colorHex={purchase.color.hex} />
      <div className="flex flex-col gap-4">
        <div>
          <p className="font-display text-2xl font-semibold">{format.text(product.name)}</p>
          <p className="mt-1 text-sm text-ink-500">{format.text(product.tagline)}</p>
        </div>
        <RatingSummary rating={product.rating} count={product.reviewCount} />
        <Price
          amount={product.priceEGP}
          compareAt={product.compareAtPriceEGP}
          showBadge
          className="text-lg"
        />
        <PurchasePanel
          purchase={purchase}
          onAdded={() => {
            onClose();
            setTimeout(openDrawer, HANDOFF_MS);
          }}
        />
        <Link
          href={`/product/${product.slug}`}
          className={buttonClasses({ variant: 'secondary', fullWidth: true })}
        >
          {t('viewDetails')}
        </Link>
      </div>
    </div>
  );
}

export function QuickView({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('product');
  const format = useFormat();
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={t('quickViewTitle', { name: format.text(product.name) })}
    >
      <QuickViewBody product={product} onClose={onClose} />
    </Modal>
  );
}

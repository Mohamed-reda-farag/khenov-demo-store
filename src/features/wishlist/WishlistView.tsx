'use client';

import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateBlocks';
import { toast } from '@/components/ui/toast';
import { catalogRepository } from '@/data/repository';
import { colorHasStock, findColor } from '@/data/stock';
import type { Product, WishlistEntry } from '@/data/types';
import { ProductCard, ProductCardSkeleton } from '@/features/catalog/components/ProductCard';
import { QuickView } from '@/features/product/QuickView';
import { Link } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';
import { useWishlistStore } from './wishlist.store';

export function WishlistSkeleton() {
  return (
    <div role="status" aria-busy className="container-page min-h-[60svh] py-8">
      <Skeleton className="mb-8 h-9 w-48" />
      <div aria-hidden className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          // Two cards on a phone: a skeleton taller than the empty state would shift the footer.
          <div key={i} className={i >= 2 ? 'max-md:hidden' : undefined}>
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

/** The two actions under a saved product: add to cart (opens the size picker) and remove. */
function WishlistActions({
  product,
  colorId,
  index,
}: {
  product: Product;
  colorId: string;
  index: number;
}) {
  const t = useTranslations('wishlist');
  const format = useFormat();
  const remove = useWishlistStore((s) => s.remove);
  const restore = useWishlistStore((s) => s.restore);
  const [pickerOpen, setPickerOpen] = useState(false);
  const name = format.text(product.name);
  const color = findColor(product, colorId);
  const canBuy = product.colors.some(colorHasStock);

  const onRemove = () => {
    const entry: WishlistEntry | null = remove(product.id);
    if (!entry) return;
    toast.show({
      message: t('removed', { name }),
      action: {
        label: t('undo'),
        onAction: () => {
          restore(entry, index);
          toast.success(t('restored', { name }));
        },
      },
    });
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      <Button
        variant="secondary"
        fullWidth
        disabled={!canBuy}
        aria-haspopup="dialog"
        onClick={() => setPickerOpen(true)}
        leadingIcon={<ShoppingBag aria-hidden className="size-4" />}
        aria-label={t('addToCartLabel', { name })}
      >
        {canBuy ? t('addToCart') : t('unavailable')}
      </Button>
      <Button
        variant="ghost"
        fullWidth
        onClick={onRemove}
        aria-label={t('removeLabel', { name })}
        leadingIcon={<Trash2 aria-hidden className="size-4" />}
      >
        {t('removeAction')}
      </Button>
      <QuickView
        product={product}
        colorId={color?.id}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}

export function WishlistView() {
  const t = useTranslations('wishlist');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const format = useFormat();
  const hydrated = useWishlistStore((s) => s.hydrated);
  const entries = useWishlistStore((s) => s.entries);

  // Loads the products of the list once it is known. Removing (and undoing) never refetches:
  // the saved entries decide what shows, the loaded products only supply the details.
  const result = useAsync(`wishlist:${hydrated}`, () =>
    catalogRepository.getByIds(useWishlistStore.getState().entries.map((e) => e.productId)),
  );

  if (!hydrated) return <WishlistSkeleton />;

  if (entries.length === 0) {
    return (
      <div className="container-page min-h-[60svh] py-12">
        <EmptyState
          as="h1"
          icon={<Heart aria-hidden className="size-7" />}
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

  if (result.status === 'error') {
    return (
      <div className="container-page min-h-[60svh] py-12">
        <ErrorState
          as="h1"
          title={states('errorTitle')}
          body={states('errorBody')}
          retryLabel={common('retry')}
          onRetry={result.retry}
        />
      </div>
    );
  }

  const products = result.status === 'success' ? result.data : result.previous;
  if (!products) return <WishlistSkeleton />;

  const count = entries.length;

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl font-semibold">{t('title')}</h1>
        <p aria-live="polite" className="text-ink-500">
          {t('count', { count, countText: format.number(count) })}
        </p>
      </header>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry, index) => {
          const product = products.find((p) => p.id === entry.productId);
          if (!product) return null;
          return (
            <li key={entry.productId}>
              <ProductCard
                product={product}
                initialColorId={entry.colorId}
                hideWishlist
                footer={(colorId) => (
                  <WishlistActions product={product} colorId={colorId} index={index} />
                )}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

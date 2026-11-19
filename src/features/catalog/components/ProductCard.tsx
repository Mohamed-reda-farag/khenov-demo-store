'use client';

import { Eye, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { galleryColorId, photoCount } from '@/data/images';
import { colorHasStock, defaultColor, findColor, isProductSoldOut } from '@/data/stock';
import type { Product } from '@/data/types';
import { QuickView } from '@/features/product/QuickView';
import { WishlistButton } from '@/features/wishlist/WishlistButton';
import { Link } from '@/i18n/navigation';
import { useFormat } from '@/lib/hooks/useFormat';
import { Price } from './Price';
import { ProductImage } from './ProductImage';

const IMAGE_SIZES = '(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw';

interface ProductCardProps {
  product: Product;
  /** Colour to start on (the wishlist remembers the one that was saved). */
  initialColorId?: string;
  /** Replaces the heart: a card that is already a wishlist entry has its own remove action. */
  hideWishlist?: boolean;
  /** Extra actions under the card, given the colour currently shown. */
  footer?: (colorId: string) => ReactNode;
}

export function ProductCard({ product, initialColorId, hideWishlist, footer }: ProductCardProps) {
  const format = useFormat();
  const t = useTranslations('product');
  const [quickOpen, setQuickOpen] = useState(false);
  const name = format.text(product.name);
  const [selectedId, setSelectedId] = useState(
    () => findColor(product, initialColorId ?? '')?.id ?? defaultColor(product)?.id ?? '',
  );
  const [hoverId, setHoverId] = useState<string | null>(null);
  const color = findColor(product, hoverId ?? selectedId) ?? product.colors[0];
  const colorHex = color?.hex ?? '#8f8e89';
  const photoColorId = color ? galleryColorId(product, color.id) : undefined;
  const soldOut = isProductSoldOut(product);
  const percent = format.discount(product.priceEGP, product.compareAtPriceEGP);
  const hasSecond = photoColorId !== undefined && photoCount(product.slug, photoColorId) > 1;

  return (
    <article className="group relative flex flex-col gap-3">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-canvas">
        <ProductImage
          fill
          slug={product.slug}
          categoryId={product.categoryId}
          alt=""
          colorHex={colorHex}
          colorId={photoColorId}
          sizes={IMAGE_SIZES}
          zoom={!hasSecond}
        />
        {hasSecond ? (
          <div className="absolute inset-0 opacity-0 transition-opacity dur-slow ease-brand group-hover:opacity-100">
            <ProductImage
              fill
              slug={product.slug}
              categoryId={product.categoryId}
              alt=""
              colorHex={colorHex}
              colorId={photoColorId}
              index={1}
              sizes={IMAGE_SIZES}
            />
          </div>
        ) : null}

        <div className="pointer-events-none absolute start-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? <Badge tone="dark">{t('soldOut')}</Badge> : null}
          {!soldOut && product.isNew ? <Badge tone="dark">{t('newBadge')}</Badge> : null}
          {percent > 0 ? (
            <Badge tone="accent">{t('discountBadge', { percent: format.percent(percent) })}</Badge>
          ) : null}
        </div>

        {hideWishlist ? null : (
          <WishlistButton
            productId={product.id}
            colorId={color?.id ?? selectedId}
            name={name}
            className="absolute end-2 top-2 z-10"
          />
        )}
        <button
          type="button"
          aria-label={t('quickView', { name })}
          aria-haspopup="dialog"
          onClick={() => setQuickOpen(true)}
          className="absolute end-2 bottom-2 z-10 grid size-11 place-items-center rounded-full bg-paper/90 text-ink-900 shadow-soft transition-opacity dur-fast hover:bg-paper focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
        >
          <Eye aria-hidden className="size-5" />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-medium">
          <Link
            href={`/product/${product.slug}?color=${color?.id ?? selectedId}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-8"
          >
            {name}
          </Link>
        </h3>
        <p className="text-sm text-ink-500">{format.text(product.tagline)}</p>
        <div className="flex items-center justify-between gap-2 pt-1 text-sm">
          <Price amount={product.priceEGP} compareAt={product.compareAtPriceEGP} />
          <span
            className="inline-flex items-center gap-1 text-xs text-ink-500"
            role="img"
            aria-label={t('ratingLabel', {
              rating: format.rating(product.rating),
              countText: format.number(product.reviewCount),
            })}
          >
            <Star aria-hidden className="size-3.5 fill-accent-500 text-accent-500" />
            <span aria-hidden>{format.rating(product.rating)}</span>
          </span>
        </div>
        <ul
          className="relative z-10 -my-3 flex items-center"
          aria-label={t('colorsLabel', {
            colors: product.colors.map((c) => format.text(c.name)).join(', '),
          })}
          onMouseLeave={() => setHoverId(null)}
        >
          {product.colors.map((c) => {
            const out = !colorHasStock(c);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  aria-pressed={c.id === selectedId}
                  aria-label={
                    out ? `${format.text(c.name)} — ${t('soldOutColor')}` : format.text(c.name)
                  }
                  onClick={() => setSelectedId(c.id)}
                  onMouseEnter={() => setHoverId(c.id)}
                  onFocus={() => setHoverId(c.id)}
                  onBlur={() => setHoverId(null)}
                  className="grid size-11 place-items-center"
                >
                  <span
                    className={`block size-3.5 rounded-full border border-sand-300 ${
                      c.id === (hoverId ?? selectedId)
                        ? 'ring-2 ring-ink-900 ring-offset-2 ring-offset-paper'
                        : ''
                    } ${out ? 'strike-diagonal text-ink-500' : ''}`}
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {footer ? <div className="relative z-10">{footer(color?.id ?? selectedId)}</div> : null}

      <QuickView
        product={product}
        colorId={color?.id}
        open={quickOpen}
        onClose={() => setQuickOpen(false)}
      />
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="aspect-[4/5] w-full rounded-md" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

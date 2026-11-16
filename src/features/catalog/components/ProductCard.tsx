'use client';

import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Product } from '@/data/types';
import { useFormat } from '@/lib/hooks/useFormat';
import { Price } from './Price';
import { ProductImage } from './ProductImage';

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const format = useFormat();
  const t = useTranslations('product');
  const name = format.text(product.name);
  const firstColor = product.colors[0];

  return (
    <article className="group flex flex-col gap-3">
      <div className="relative">
        <ProductImage
          slug={product.slug}
          categoryId={product.categoryId}
          alt={name}
          colorHex={firstColor?.hex ?? '#8f8e89'}
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw"
          priority={priority}
          zoom
        />
        {product.isNew ? (
          <div className="absolute start-3 top-3">
            <Badge tone="dark">{t('newBadge')}</Badge>
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-display text-base font-medium">{name}</h3>
        <p className="text-sm text-ink-500">{format.text(product.tagline)}</p>
        <div className="flex items-center justify-between gap-2 pt-1 text-sm">
          <Price amount={product.priceEGP} compareAt={product.compareAtPriceEGP} />
          <span
            className="inline-flex items-center gap-1 text-xs text-ink-500"
            aria-label={t('ratingLabel', {
              rating: format.rating(product.rating),
              countText: format.number(product.reviewCount),
            })}
          >
            <Star aria-hidden className="size-3.5 fill-accent-500 text-accent-500" />
            {format.rating(product.rating)}
          </span>
        </div>
        {/* Spacer keeps swatches aligned across cards */}
        <ul
          className="flex items-center gap-1.5 pt-1"
          aria-label={product.colors.map((c) => format.text(c.name)).join(', ')}
        >
          {product.colors.map((color) => (
            <li
              key={color.id}
              className="size-3.5 rounded-full border border-sand-300"
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </ul>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

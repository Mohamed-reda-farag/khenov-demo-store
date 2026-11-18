'use client';

import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type KeyboardEvent } from 'react';
import { photoCount } from '@/data/images';
import type { Product } from '@/data/types';
import { ProductImage } from '@/features/catalog/components/ProductImage';
import { useFormat } from '@/lib/hooks/useFormat';
import { Lightbox } from './Lightbox';

interface GalleryProps {
  product: Product;
  /** Hex of the selected colour, used by the generated placeholder. */
  colorHex: string;
  /** Load the first image eagerly (only the page's LCP image should). */
  priority?: boolean;
  className?: string;
}

/**
 * Main image + thumbnails. Real photos are shared by all colours (they are stock photos), so a
 * swatch changes availability and the placeholder tint, not the photograph.
 */
export function Gallery({ product, colorHex, priority = false, className = '' }: GalleryProps) {
  const t = useTranslations('product');
  const format = useFormat();
  const count = Math.max(1, photoCount(product.slug));
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const rtl = format.locale === 'ar';
  const name = format.text(product.name);

  const go = (next: number) => setIndex((next + count) % count);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forward) {
      event.preventDefault();
      go(index + 1);
    } else if (event.key === backward) {
      event.preventDefault();
      go(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      go(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      go(count - 1);
    }
  };

  return (
    <div
      className={`flex flex-col gap-3 md:flex-row-reverse ${className}`}
      role="group"
      aria-roledescription="carousel"
      aria-label={t('galleryLabel', { name })}
    >
      <div
        className="relative min-w-0 flex-1 outline-offset-4"
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={onKeyDown}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-canvas">
          {Array.from({ length: count }, (_, i) => (
            <div
              key={i}
              aria-hidden={i !== index}
              className={`absolute inset-0 transition-opacity dur-base ease-brand ${
                i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <ProductImage
                fill
                slug={product.slug}
                categoryId={product.categoryId}
                alt={t('photoAlt', { name, n: format.number(i + 1) })}
                colorHex={colorHex}
                index={i}
                sizes="(min-width: 1024px) 45vw, (min-width: 768px) 55vw, 100vw"
                priority={priority && i === 0}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label={t('openViewer')}
            className="absolute inset-0 cursor-zoom-in"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute end-3 bottom-3 grid size-11 place-items-center rounded-full bg-paper/90 shadow-soft"
          >
            <Maximize2 className="size-5" />
          </span>
          {count > 1 ? (
            <>
              <button
                type="button"
                aria-label={t('previousPhoto')}
                onClick={() => go(index - 1)}
                className="absolute start-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-paper/90 shadow-soft hover:bg-paper"
              >
                <ChevronLeft aria-hidden className="size-5 rtl:-scale-x-100" />
              </button>
              <button
                type="button"
                aria-label={t('nextPhoto')}
                onClick={() => go(index + 1)}
                className="absolute end-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-paper/90 shadow-soft hover:bg-paper"
              >
                <ChevronRight aria-hidden className="size-5 rtl:-scale-x-100" />
              </button>
            </>
          ) : null}
        </div>
        <p className="sr-only" aria-live="polite">
          {t('photoStatus', { n: format.number(index + 1), total: format.number(count) })}
        </p>
      </div>

      {count > 1 ? (
        <ul className="flex shrink-0 gap-2 md:w-20 md:flex-col">
          {Array.from({ length: count }, (_, i) => (
            <li key={i} className="w-16 md:w-full">
              <button
                type="button"
                aria-label={t('photoStatus', {
                  n: format.number(i + 1),
                  total: format.number(count),
                })}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`relative block aspect-[4/5] w-full overflow-hidden rounded-sm border-2 ${
                  i === index ? 'border-ink-900' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <ProductImage
                  fill
                  slug={product.slug}
                  categoryId={product.categoryId}
                  alt=""
                  colorHex={colorHex}
                  index={i}
                  sizes="80px"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {zoomOpen ? (
        <Lightbox
          product={product}
          colorHex={colorHex}
          count={count}
          index={index}
          onIndexChange={setIndex}
          onClose={() => setZoomOpen(false)}
        />
      ) : null}
    </div>
  );
}

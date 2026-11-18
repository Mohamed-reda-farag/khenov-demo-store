'use client';

import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Portal } from '@/components/ui/Portal';
import { useOverlayBehavior } from '@/components/ui/overlay';
import { ProductImage } from '@/features/catalog/components/ProductImage';
import type { Product } from '@/data/types';
import { useFormat } from '@/lib/hooks/useFormat';

interface LightboxProps {
  product: Product;
  colorHex: string;
  count: number;
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const ZOOM = 2.2;

/** Full-screen viewer with click/tap zoom. Panning follows the pointer (transform only). */
export function Lightbox({
  product,
  colorHex,
  count,
  index,
  onIndexChange,
  onClose,
}: LightboxProps) {
  const t = useTranslations('product');
  const format = useFormat();
  const panelRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const rtl = format.locale === 'ar';
  const name = format.text(product.name);

  useOverlayBehavior(true, panelRef, onClose);

  const go = (next: number) => {
    setZoomed(false);
    onIndexChange((next + count) % count);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      const backward = rtl ? 'ArrowRight' : 'ArrowLeft';
      if (event.key === forward) go(index + 1);
      if (event.key === backward) go(index - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rtl, index, count]);

  const track = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setOrigin({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    });
  };

  return (
    <Portal>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('lightboxLabel', {
          name,
          n: format.number(index + 1),
          total: format.number(count),
        })}
        tabIndex={-1}
        className="fixed inset-0 z-overlay flex flex-col bg-ink-900 text-paper outline-none"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-2">
          <p className="text-sm" aria-hidden>
            {format.number(index + 1)} / {format.number(count)}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              aria-pressed={zoomed}
              aria-label={t(zoomed ? 'zoomOut' : 'zoomIn')}
              onClick={() => setZoomed((z) => !z)}
              className="grid size-11 place-items-center rounded-full hover:bg-ink-700"
            >
              {zoomed ? (
                <ZoomOut aria-hidden className="size-5" />
              ) : (
                <ZoomIn aria-hidden className="size-5" />
              )}
            </button>
            <button
              type="button"
              aria-label={t('closeViewer')}
              onClick={onClose}
              data-autofocus
              className="grid size-11 place-items-center rounded-full hover:bg-ink-700"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4">
          <div
            className={`relative aspect-[4/5] h-full max-h-full max-w-full overflow-hidden rounded-md ${
              zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={(event) => {
              track(event as unknown as PointerEvent<HTMLElement>);
              setZoomed((z) => !z);
            }}
            onPointerMove={zoomed ? track : undefined}
          >
            <div
              className="absolute inset-0 transition-transform dur-slow ease-brand"
              style={{
                transform: zoomed ? `scale(${ZOOM})` : 'none',
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
            >
              <ProductImage
                fill
                slug={product.slug}
                categoryId={product.categoryId}
                alt={t('photoAlt', { name, n: format.number(index + 1) })}
                colorHex={colorHex}
                index={index}
                sizes="(min-width: 1024px) 70vh, 100vw"
              />
            </div>
          </div>

          {count > 1 ? (
            <>
              <button
                type="button"
                aria-label={t('previousPhoto')}
                onClick={() => go(index - 1)}
                className="absolute start-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-ink-900/70 hover:bg-ink-700"
              >
                <ChevronLeft aria-hidden className="size-6 rtl:-scale-x-100" />
              </button>
              <button
                type="button"
                aria-label={t('nextPhoto')}
                onClick={() => go(index + 1)}
                className="absolute end-3 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-ink-900/70 hover:bg-ink-700"
              >
                <ChevronRight aria-hidden className="size-6 rtl:-scale-x-100" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </Portal>
  );
}

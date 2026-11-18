'use client';

import { ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Locale } from '@/data/types';
import { ArtTile } from '@/features/catalog/components/ProductImage';
import { Link } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { loadNavData } from './nav';

const linkClass =
  'inline-flex min-h-11 items-center rounded-pill px-4 text-sm font-medium hover:bg-sand-100';

export function MegaNav() {
  const t = useTranslations('nav');
  const common = useTranslations('common');
  const locale = useLocale() as Locale;
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nav = useAsync('nav', loadNavData);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  useEffect(() => cancelClose, []);

  return (
    <nav aria-label={t('label')} className="hidden items-center gap-1 lg:flex">
      <div
        ref={rootRef}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return;
          cancelClose();
          setOpen(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') scheduleClose();
        }}
        onBlur={(e) => {
          if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setOpen(false);
        }}
      >
        <button
          ref={triggerRef}
          type="button"
          className={`${linkClass} gap-1`}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {t('shop')}
          <ChevronDown
            aria-hidden
            className={`size-4 transition-transform dur-base ease-brand ${open ? 'rotate-180' : ''}`}
          />
        </button>

        <div
          id={panelId}
          hidden={!open}
          className="absolute inset-x-0 top-full z-mega border-t border-sand-200 bg-paper shadow-lift"
        >
          <div className="container-page grid grid-cols-[1fr_1fr_1.2fr] gap-12 py-10">
            {nav.status === 'loading' ? (
              <>
                <NavSkeleton />
                <NavSkeleton />
                <Skeleton className="h-48 w-full rounded-lg" />
              </>
            ) : nav.status === 'error' ? (
              <div className="col-span-3 py-6 text-center">
                <button
                  type="button"
                  onClick={nav.retry}
                  className="text-sm text-accent-600 underline"
                >
                  {common('retry')}
                </button>
              </div>
            ) : (
              <>
                <section aria-label={t('byCategory')}>
                  <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                    {t('byCategory')}
                  </h3>
                  <ul className="flex flex-col">
                    <li>
                      <Link
                        href="/shop"
                        onClick={() => setOpen(false)}
                        className="inline-flex min-h-11 items-center text-lg font-medium hover:underline"
                      >
                        {t('shopAll')}
                      </Link>
                    </li>
                    {nav.data.categories.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/category/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="inline-flex min-h-11 items-center hover:underline"
                        >
                          {c.name[locale]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
                <section aria-label={t('byCollection')}>
                  <h3 className="mb-3 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                    {t('byCollection')}
                  </h3>
                  <ul className="flex flex-col">
                    {nav.data.collections.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/collection/${c.slug}`}
                          onClick={() => setOpen(false)}
                          className="inline-flex min-h-11 items-center hover:underline"
                        >
                          {c.name[locale]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
                {nav.data.promo ? (
                  <Link
                    href={nav.data.promo.href}
                    onClick={() => setOpen(false)}
                    className="group relative block overflow-hidden rounded-lg"
                  >
                    <ArtTile
                      silhouette={nav.data.promo.silhouette}
                      tone={nav.data.promo.tone}
                      color="#b5532e"
                      className="h-56 w-full [&_svg]:h-full"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/70 to-transparent p-5 text-white">
                      <span className="block font-display text-lg font-semibold">
                        {nav.data.promo.title[locale]}
                      </span>
                      <span className="text-sm opacity-90">{nav.data.promo.cta[locale]}</span>
                    </span>
                  </Link>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <Link href="/shop?new=1&sort=newest" className={linkClass}>
        {t('newIn')}
      </Link>
      <Link href="/shop?sale=1" className={linkClass}>
        {t('offers')}
      </Link>
    </nav>
  );
}

function NavSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-3 w-24" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-4 w-40" />
      ))}
    </div>
  );
}

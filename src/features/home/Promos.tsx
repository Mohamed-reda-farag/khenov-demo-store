'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Banner } from '@/data/types';
import { Link } from '@/i18n/navigation';
import { useFormat } from '@/lib/hooks/useFormat';
import { BannerImage } from './BannerImage';

/** Full-width dark strip (shipping promise). */
export function PromoStrip({ banner }: { banner: Banner }) {
  const format = useFormat();
  return (
    <section aria-label={format.text(banner.title)} className="mt-24 bg-ink-900 text-paper">
      <div className="container-page flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center">
        <p className="font-display text-lg font-medium">{format.text(banner.title)}</p>
        <Link
          href={banner.href}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent-100 underline underline-offset-4 hover:text-white"
        >
          {format.text(banner.cta)}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Link>
      </div>
    </section>
  );
}

const toneBg: Record<Banner['tone'], string> = {
  sand: 'bg-sand-100',
  sage: 'bg-canvas',
  blush: 'bg-accent-100',
  stone: 'bg-canvas',
  mist: 'bg-canvas',
  ink: 'bg-ink-900',
};

/** Two side-by-side promo tiles. */
export function PromoTiles({ banners }: { banners: readonly Banner[] }) {
  const format = useFormat();
  const nav = useTranslations('nav');
  return (
    <section aria-label={nav('offers')}>
      <ul className="grid gap-4 md:grid-cols-2">
        {banners.map((banner) => (
          <li key={banner.id}>
            <Link
              href={banner.href}
              className={`group grid min-h-64 grid-cols-[1fr_9rem] items-center overflow-hidden rounded-lg sm:grid-cols-[1fr_12rem] ${toneBg[banner.tone]}`}
            >
              <span className="flex flex-col items-start gap-2 p-6">
                <span className="font-display text-xl font-semibold">
                  {format.text(banner.title)}
                </span>
                <span className="text-sm text-ink-700">{format.text(banner.subtitle)}</span>
                <span className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4">
                  {format.text(banner.cta)}
                  <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                </span>
              </span>
              <span className="relative h-full min-h-64 overflow-hidden">
                <BannerImage banner={banner} sizes="200px" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

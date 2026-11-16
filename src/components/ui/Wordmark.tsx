'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/** ATHAR / أثر — a footprint-arc mark plus a locale-aware wordmark. */
export function Wordmark({
  className = '',
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  const t = useTranslations('brand');
  const locale = useLocale();
  return (
    <Link
      href="/"
      aria-label={t('name')}
      className={`inline-flex min-h-11 items-center gap-2 ${className}`}
    >
      <svg aria-hidden viewBox="0 0 28 28" className="size-7 shrink-0">
        <circle
          cx="14"
          cy="14"
          r="13"
          fill={inverted ? 'var(--color-paper)' : 'var(--color-ink-900)'}
        />
        <path
          d="M8 18.5c1.6-5.2 4.3-7.8 8.2-7.8 2 0 3.2.9 3.8 2.6"
          fill="none"
          stroke={inverted ? 'var(--color-ink-900)' : 'var(--color-paper)'}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="19.4" cy="18.4" r="2.3" fill="var(--color-accent-500)" />
      </svg>
      <span
        className={
          locale === 'ar'
            ? 'font-display text-2xl leading-none font-bold'
            : 'font-display text-xl leading-none font-bold tracking-[0.24em]'
        }
      >
        {t('name')}
      </span>
    </Link>
  );
}

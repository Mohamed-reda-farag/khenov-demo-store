'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormat } from '@/lib/hooks/useFormat';
import { pageWindow } from './shop-params';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}

const base =
  'grid min-h-11 min-w-11 place-items-center rounded-pill px-3 text-sm font-medium transition-colors dur-fast';

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  const t = useTranslations('shop');
  const format = useFormat();
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={t('pagination')} className="mt-12">
      <ul className="flex flex-wrap items-center justify-center gap-1">
        <li>
          <button
            type="button"
            aria-label={t('previousPage')}
            disabled={page <= 1}
            onClick={() => onChange(page - 1)}
            className={`${base} hover:bg-sand-100 disabled:pointer-events-none disabled:opacity-40`}
          >
            <ChevronLeft aria-hidden className="size-5 rtl:-scale-x-100" />
          </button>
        </li>
        {pageWindow(page, pageCount).map((entry, index) =>
          entry === null ? (
            <li key={`gap-${index}`} aria-hidden className="px-1 text-ink-500">
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                aria-label={t('goToPage', { page: format.number(entry) })}
                aria-current={entry === page ? 'page' : undefined}
                onClick={() => onChange(entry)}
                className={`${base} ${
                  entry === page ? 'bg-ink-900 text-paper' : 'hover:bg-sand-100'
                }`}
              >
                {format.number(entry)}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            aria-label={t('nextPage')}
            disabled={page >= pageCount}
            onClick={() => onChange(page + 1)}
            className={`${base} hover:bg-sand-100 disabled:pointer-events-none disabled:opacity-40`}
          >
            <ChevronRight aria-hidden className="size-5 rtl:-scale-x-100" />
          </button>
        </li>
      </ul>
    </nav>
  );
}

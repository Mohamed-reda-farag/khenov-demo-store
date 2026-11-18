'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Drawer } from '@/components/ui/Drawer';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Locale } from '@/data/types';
import { Link } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { LanguageSwitcher } from './LanguageSwitcher';
import { loadNavData, useMobileNavStore } from './nav';

const rowClass =
  'flex min-h-12 items-center border-b border-sand-100 text-base font-medium hover:text-accent-600';

export function MobileNavDrawer() {
  const t = useTranslations('nav');
  const common = useTranslations('common');
  const locale = useLocale() as Locale;
  const open = useMobileNavStore((s) => s.open);
  const setOpen = useMobileNavStore((s) => s.setOpen);
  const close = () => setOpen(false);
  const nav = useAsync('nav', loadNavData);

  return (
    <Drawer open={open} onClose={close} title={t('menu')} side="start">
      <nav aria-label={t('label')} className="px-6 py-2">
        <Link href="/shop" onClick={close} className={`${rowClass} text-lg`}>
          {t('shopAll')}
        </Link>
        {nav.status === 'loading' ? (
          <div className="flex flex-col gap-4 py-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-5 w-40" />
            ))}
          </div>
        ) : nav.status === 'error' ? (
          <button
            type="button"
            onClick={nav.retry}
            className="min-h-12 text-sm text-accent-600 underline"
          >
            {common('retry')}
          </button>
        ) : (
          <>
            {nav.data.categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                onClick={close}
                className={`${rowClass} ps-4 text-ink-700`}
              >
                {c.name[locale]}
              </Link>
            ))}
          </>
        )}
        <Link href="/shop?new=1&sort=newest" onClick={close} className={rowClass}>
          {t('newIn')}
        </Link>
        <Link href="/shop?sale=1" onClick={close} className={rowClass}>
          {t('offers')}
        </Link>
        <div className="pt-4">
          <LanguageSwitcher className="border border-sand-300" />
        </div>
      </nav>
    </Drawer>
  );
}

import { useLocale, useTranslations } from 'next-intl';
import { FREE_SHIPPING_THRESHOLD } from '@/data/rules/shipping';
import type { Locale } from '@/data/types';
import { formatPrice } from '@/lib/format';

/** Demo badge + shipping promise. Non-interactive; the "Reset demo" action lives in the footer. */
export function AnnouncementBar() {
  const t = useTranslations('announcement');
  const locale = useLocale() as Locale;
  return (
    <section aria-label={t('label')} className="bg-ink-900 text-paper">
      <div className="container-page flex min-h-10 items-center justify-between gap-4 text-xs">
        <span className="hidden shrink-0 rounded-pill border border-ink-500 px-3 py-0.5 font-medium sm:inline">
          {t('demoBadge')}
        </span>
        <p className="flex-1 text-center sm:text-start md:text-center">
          {t('shipping', { amount: formatPrice(FREE_SHIPPING_THRESHOLD, locale) })}
        </p>
        <span aria-hidden className="hidden w-32 shrink-0 sm:block" />
      </div>
    </section>
  );
}

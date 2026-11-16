'use client';

import { useLocale, useTranslations } from 'next-intl';
import { preferencesRepository } from '@/data/repository';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const t = useTranslations('language');
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const next: AppLocale = locale === 'ar' ? 'en' : 'ar';

  const switchLocale = () => {
    preferencesRepository.setLocale(next);
    // Read the query at click time: useSearchParams would force a Suspense boundary on every page.
    const query = Object.fromEntries(new URLSearchParams(window.location.search));
    router.replace({ pathname, query }, { locale: next });
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={t('switchLabel')}
      lang={next}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill px-3 text-sm font-semibold hover:bg-sand-100 ${className}`}
    >
      {t('switchTo')}
    </button>
  );
}

'use client';

import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

/** Error boundary for every page: the header and footer stay, only the page is replaced. */
export default function PageError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('errorPage');

  return (
    <div
      role="alert"
      className="container-page flex min-h-[60svh] flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <div className="grid size-16 place-items-center rounded-full bg-warning-100 text-warning-700">
        <TriangleAlert aria-hidden className="size-7" />
      </div>
      <h1 className="font-display text-3xl font-semibold">{t('title')}</h1>
      <p className="max-w-md text-ink-700">{t('body')}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>{t('retry')}</Button>
        <Link href="/" className={buttonClasses({ variant: 'secondary' })}>
          {t('home')}
        </Link>
      </div>
    </div>
  );
}

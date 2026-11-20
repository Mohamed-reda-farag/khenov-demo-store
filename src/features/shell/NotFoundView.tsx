import { Compass } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

/** Localized "page not found" with the places a lost visitor most likely wants. */
export function NotFoundView() {
  const t = useTranslations('notFound');

  return (
    <div className="container-page flex min-h-[60svh] flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-sand-100 text-ink-700">
        <Compass aria-hidden className="size-7" />
      </div>
      <p className="text-sm font-medium tracking-wide text-ink-500">
        <bdi>{t('code')}</bdi>
      </p>
      <h1 className="font-display text-3xl font-semibold">{t('title')}</h1>
      <p className="max-w-md text-ink-700">{t('body')}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses({})}>
          {t('home')}
        </Link>
        <Link href="/shop" className={buttonClasses({ variant: 'secondary' })}>
          {t('shop')}
        </Link>
        <Link href="/search" className={buttonClasses({ variant: 'secondary' })}>
          {t('search')}
        </Link>
        <Link href="/help/contact" className={buttonClasses({ variant: 'secondary' })}>
          {t('help')}
        </Link>
      </div>
    </div>
  );
}

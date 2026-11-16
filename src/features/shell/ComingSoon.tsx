import { Hammer } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { buttonClasses } from '@/components/ui/Button';
import { Link } from '@/i18n/navigation';

/** Shown for routes that belong to a later milestone, so the shell never leads to a dead end. */
export function ComingSoon() {
  const t = useTranslations('comingSoon');
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-sand-100 text-ink-700">
        <Hammer aria-hidden className="size-7" />
      </div>
      <h1 className="font-display text-2xl font-semibold">{t('title')}</h1>
      <p className="text-ink-500">{t('body')}</p>
      <Link href="/" className={`${buttonClasses({ variant: 'secondary' })} mt-2`}>
        {t('cta')}
      </Link>
    </div>
  );
}

import { useTranslations } from 'next-intl';
import { Wordmark } from '@/components/ui/Wordmark';
import { ResetDemoButton } from '@/features/demo/ResetDemo';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NewsletterForm } from './NewsletterForm';

const linkClass =
  'inline-flex min-h-11 items-center text-sm text-sand-200 hover:text-white hover:underline underline-offset-4';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');
  const demo = useTranslations('announcement');
  const newsletter = useTranslations('newsletter');

  return (
    <footer className="mt-24 bg-ink-900 text-paper">
      <div className="border-b border-ink-700">
        <div className="container-page grid gap-8 py-12 md:grid-cols-2 md:items-center md:gap-16">
          <div>
            <h2 className="font-display text-2xl font-semibold">{newsletter('title')}</h2>
            <p className="mt-2 max-w-md text-sm text-sand-300">{newsletter('body')}</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="flex max-w-sm flex-col items-start gap-4">
          <Wordmark inverted />
          <p className="text-sm text-sand-300">{t('about')}</p>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-sand-300 uppercase">
            {t('shopTitle')}
          </h2>
          <ul>
            <li>
              <Link href="/shop" className={linkClass}>
                {nav('shopAll')}
              </Link>
            </li>
            <li>
              <Link href="/shop?new=1&sort=newest" className={linkClass}>
                {nav('newIn')}
              </Link>
            </li>
            <li>
              <Link href="/shop?sale=1" className={linkClass}>
                {nav('offers')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-sand-300 uppercase">
            {t('helpTitle')}
          </h2>
          <ul>
            <li>
              <Link href="/help/shipping" className={linkClass}>
                {t('helpShipping')}
              </Link>
            </li>
            <li>
              <Link href="/help/returns" className={linkClass}>
                {t('helpReturns')}
              </Link>
            </li>
            <li>
              <Link href="/help/size-guide" className={linkClass}>
                {t('helpSizeGuide')}
              </Link>
            </li>
            <li>
              <Link href="/help/contact" className={linkClass}>
                {t('helpContact')}
              </Link>
            </li>
            <li>
              <Link href="/help/privacy" className={linkClass}>
                {t('helpPrivacy')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-sand-300 uppercase">
            {t('demoTitle')}
          </h2>
          <ul>
            <li>
              <LanguageSwitcher className="-ms-3 text-sand-200 hover:text-white" />
            </li>
            <li>
              <ResetDemoButton className="text-sand-200 hover:text-white" />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-700">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-sand-300 md:flex-row md:items-center md:justify-between">
          <p>{t('disclaimer')}</p>
          <p className="w-fit rounded-pill border border-ink-500 px-3 py-0.5">
            {demo('demoBadge')}
          </p>
        </div>
      </div>
    </footer>
  );
}

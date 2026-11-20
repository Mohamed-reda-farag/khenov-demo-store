import { useLocale, useTranslations } from 'next-intl';
import { buttonClasses } from '@/components/ui/Button';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS } from '@/data/rules/shipping';
import type { Locale } from '@/data/types';
import { SizeGuideContent } from '@/features/product/SizeGuideContent';
import { Link } from '@/i18n/navigation';
import { formatNumber, formatPrice } from '@/lib/format';
import { ContactForm } from './ContactForm';
import { Faq } from './Faq';
import { HelpLayout, HelpSection } from './HelpLayout';

export function ShippingPage() {
  const t = useTranslations('help.shipping');
  const locale = useLocale() as Locale;

  return (
    <HelpLayout slug="shipping" intro={t('intro')}>
      <HelpSection title={t('ratesTitle')}>
        <table className="w-full border-collapse text-start text-sm">
          <caption className="sr-only">{t('ratesTitle')}</caption>
          <thead>
            <tr className="border-b border-ink-900 text-xs tracking-wide text-ink-500 uppercase">
              <th scope="col" className="py-2 text-start font-medium">
                {t('colMethod')}
              </th>
              <th scope="col" className="py-2 text-start font-medium">
                {t('colPrice')}
              </th>
              <th scope="col" className="py-2 text-start font-medium">
                {t('colTime')}
              </th>
            </tr>
          </thead>
          <tbody>
            {SHIPPING_METHODS.map((method) => (
              <tr key={method.id} className="border-b border-sand-200">
                <th scope="row" className="py-3 pe-3 text-start font-semibold text-ink-900">
                  {t(method.id)}
                </th>
                <td className="py-3 pe-3">{formatPrice(method.priceEGP, locale)}</td>
                <td className="py-3">
                  {t('days', {
                    from: formatNumber(method.minDays, locale),
                    to: formatNumber(method.maxDays, locale),
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{t('freeFrom', { amount: formatPrice(FREE_SHIPPING_THRESHOLD, locale) })}</p>
      </HelpSection>
      <HelpSection title={t('workingTitle')}>
        <p>{t('working')}</p>
      </HelpSection>
      <HelpSection title={t('trackTitle')}>
        <p>{t('track')}</p>
      </HelpSection>
      <HelpSection title={t('codTitle')}>
        <p>{t('cod')}</p>
      </HelpSection>
      <Link href="/shop" className={`${buttonClasses({})} w-fit`}>
        {t('cta')}
      </Link>
    </HelpLayout>
  );
}

export function ReturnsPage() {
  const t = useTranslations('help.returns');

  return (
    <HelpLayout slug="returns" intro={t('intro')}>
      <HelpSection title={t('cancelTitle')}>
        <p>{t('cancel')}</p>
      </HelpSection>
      <HelpSection title={t('exchangeTitle')}>
        <p>{t('exchange')}</p>
      </HelpSection>
      <HelpSection title={t('refundTitle')}>
        <p>{t('refund')}</p>
      </HelpSection>
      <HelpSection title={t('demoTitle')}>
        <p>{t('demo')}</p>
      </HelpSection>
      <Link href="/help/contact" className={`${buttonClasses({ variant: 'secondary' })} w-fit`}>
        {t('cta')}
      </Link>
    </HelpLayout>
  );
}

export function SizeGuidePage() {
  const t = useTranslations('help.sizeGuide');

  return (
    <HelpLayout slug="size-guide">
      <SizeGuideContent headingLevel={2} />
      <Link href="/shop" className={`${buttonClasses({})} w-fit`}>
        {t('cta')}
      </Link>
    </HelpLayout>
  );
}

export function ContactPage() {
  const t = useTranslations('help.contact');

  return (
    <HelpLayout slug="contact" intro={t('intro')}>
      <HelpSection title={t('faqTitle')}>
        <Faq />
      </HelpSection>
      <HelpSection title={t('formTitle')}>
        <ContactForm />
      </HelpSection>
    </HelpLayout>
  );
}

export function PrivacyPage() {
  const t = useTranslations('help.privacy');

  return (
    <HelpLayout slug="privacy" intro={t('intro')}>
      <HelpSection title={t('whatTitle')}>
        <p>{t('what')}</p>
      </HelpSection>
      <HelpSection title={t('storedTitle')}>
        <p>{t('stored')}</p>
      </HelpSection>
      <HelpSection title={t('notTitle')}>
        <p>{t('not')}</p>
      </HelpSection>
      <HelpSection title={t('resetTitle')}>
        <p>{t('reset')}</p>
      </HelpSection>
      <HelpSection title={t('toolsTitle')}>
        <p>{t('tools')}</p>
      </HelpSection>
      <p className="text-sm text-ink-500">{t('madeBy')}</p>
    </HelpLayout>
  );
}

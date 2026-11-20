import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/data/types';
import { formatNumber } from '@/lib/format';
import { sizeGuideRows } from './size-guide';

/** The size table and measuring tips, shared by the product-page modal and the help page. */
export function SizeGuideContent({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const t = useTranslations('product');
  const locale = useLocale() as Locale;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <div className="flex flex-col gap-5 text-sm text-ink-700">
      <p>{t('sizeGuideIntro')}</p>
      <table className="w-full border-collapse text-center">
        <caption className="sr-only">{t('sizeGuideTitle')}</caption>
        <thead>
          <tr className="border-b border-ink-900 text-xs tracking-wide text-ink-500 uppercase">
            <th scope="col" className="py-2 font-medium">
              {t('sizeGuideEu')}
            </th>
            <th scope="col" className="py-2 font-medium">
              {t('sizeGuideCm')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sizeGuideRows().map((row) => (
            <tr key={row.eu} className="border-b border-sand-200">
              <th scope="row" className="py-2.5 font-semibold text-ink-900">
                <bdi>{formatNumber(row.eu, locale)}</bdi>
              </th>
              <td className="py-2.5">
                <bdi>
                  {formatNumber(row.cm, locale, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <Heading className="font-display font-semibold text-ink-900">
          {t('sizeGuideHowTitle')}
        </Heading>
        <p className="mt-1">{t('sizeGuideHow')}</p>
      </div>
      <p className="text-xs text-ink-500">{t('sizeGuideNote')}</p>
    </div>
  );
}

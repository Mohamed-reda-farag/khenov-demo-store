'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { useFormat } from '@/lib/hooks/useFormat';
import { sizeGuideRows } from './size-guide';

export function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('product');
  const format = useFormat();
  const rows = sizeGuideRows();

  return (
    <Modal open={open} onClose={onClose} title={t('sizeGuideTitle')} size="md">
      <div className="flex flex-col gap-5 px-5 py-5 text-sm text-ink-700">
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
            {rows.map((row) => (
              <tr key={row.eu} className="border-b border-sand-200">
                <th scope="row" className="py-2.5 font-semibold text-ink-900">
                  <bdi>{format.number(row.eu)}</bdi>
                </th>
                <td className="py-2.5">
                  <bdi>
                    {format.number(row.cm, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </bdi>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <h3 className="font-display font-semibold text-ink-900">{t('sizeGuideHowTitle')}</h3>
          <p className="mt-1">{t('sizeGuideHow')}</p>
        </div>
        <p className="text-xs text-ink-500">{t('sizeGuideNote')}</p>
      </div>
    </Modal>
  );
}

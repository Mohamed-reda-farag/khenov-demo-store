'use client';

import { useTranslations } from 'next-intl';
import { Accordion } from '@/components/ui/Accordion';
import type { Product } from '@/data/types';
import { useFormat } from '@/lib/hooks/useFormat';

export function ProductDetails({ product }: { product: Product }) {
  const t = useTranslations('product');
  const format = useFormat();

  return (
    <Accordion
      defaultOpen={['details']}
      items={[
        {
          id: 'details',
          title: t('detailsTitle'),
          content: (
            <div className="flex flex-col gap-3">
              <p>{format.text(product.description)}</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                <dt className="text-ink-500">{t('materials')}</dt>
                <dd>{format.text(product.materials)}</dd>
                <dt className="text-ink-500">{t('sku')}</dt>
                <dd>
                  <bdi>{product.sku}</bdi>
                </dd>
              </dl>
            </div>
          ),
        },
        { id: 'delivery', title: t('deliveryTitle'), content: <p>{t('deliveryBody')}</p> },
        { id: 'returns', title: t('returnsTitle'), content: <p>{t('returnsBody')}</p> },
      ]}
    />
  );
}

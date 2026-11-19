'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { photoColorFor } from '@/data/images';
import type { PromoResult } from '@/data/rules/promo';
import type { Totals } from '@/data/rules/totals';
import type { CartLine } from '@/data/types';
import { OrderSummaryRows } from '@/features/cart/OrderSummary';
import { PromoBox } from '@/features/cart/PromoBox';
import { ProductImage } from '@/features/catalog/components/ProductImage';
import { useFormat } from '@/lib/hooks/useFormat';

interface CheckoutSummaryProps {
  lines: readonly CartLine[];
  totals: Totals;
  promo: PromoResult | null;
  shippingLabel: string;
  /** Disables the promo field while an order is being placed. */
  locked: boolean;
}

/** The order recap beside the form. On small screens it folds into a bar showing the total. */
export function CheckoutSummary({
  lines,
  totals,
  promo,
  shippingLabel,
  locked,
}: CheckoutSummaryProps) {
  const t = useTranslations('checkout');
  const format = useFormat();
  const panelId = useId();
  const [open, setOpen] = useState(false);

  return (
    <aside
      aria-label={t('summary')}
      className="bg-sand-50 rounded-lg border border-sand-200 lg:sticky lg:top-28"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-5 py-3 text-start lg:hidden"
      >
        <span className="flex items-center gap-2 font-medium">
          {open ? t('hideSummary') : t('showSummary')}
          <ChevronDown
            aria-hidden
            className={`size-4 transition-transform dur-fast ${open ? 'rotate-180' : ''}`}
          />
        </span>
        <span className="font-display text-lg font-semibold">{format.price(totals.total)}</span>
      </button>

      <div
        id={panelId}
        className={`flex flex-col gap-6 border-t border-sand-200 p-5 lg:block lg:border-0 lg:p-6 ${open ? '' : 'max-lg:hidden'}`}
      >
        <h2 className="hidden font-display text-xl font-semibold lg:block">{t('summary')}</h2>
        <ul className="flex flex-col gap-4 lg:mt-5">
          {lines.map((line) => (
            <li key={line.id} className="flex items-center gap-4">
              <div className="relative w-16 shrink-0">
                <ProductImage
                  slug={line.slug}
                  categoryId={line.categoryId}
                  alt=""
                  colorHex={line.colorHex}
                  colorId={photoColorFor(line.slug, line.colorId)}
                  sizes="64px"
                  className="rounded-md"
                />
                <span className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-paper">
                  {format.number(line.quantity)}
                </span>
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium">{format.text(line.name)}</p>
                <p className="text-ink-500">
                  {format.text(line.colorName)} · {format.number(line.size)}
                </p>
              </div>
              <span className="text-sm font-medium">
                {format.price(line.unitPriceEGP * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className={`lg:mt-6 ${locked ? 'pointer-events-none opacity-60' : ''}`} inert={locked}>
          <PromoBox subtotal={totals.subtotal} result={promo} />
        </div>
        <div className="lg:mt-6">
          <OrderSummaryRows totals={totals} promo={promo} shippingLabel={shippingLabel} />
        </div>
      </div>
    </aside>
  );
}

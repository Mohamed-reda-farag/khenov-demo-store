'use client';

import { Ruler } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { colorHasStock, isProductSoldOut, stockLevel } from '@/data/stock';
import { useCartStore } from '@/features/cart/cart.store';
import { useFormat } from '@/lib/hooks/useFormat';
import { SizeGuideModal } from './SizeGuideModal';
import type { Purchase } from './usePurchase';

interface PurchasePanelProps {
  purchase: Purchase;
  /** Called after a successful add. Defaults to opening the mini-cart. */
  onAdded?: () => void;
  /** Lets the sticky bar know when the real add-to-cart button is on screen. */
  registerCta?: (element: HTMLDivElement | null) => void;
}

function SizeGrid({
  register,
  children,
}: {
  register: (element: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  return (
    <div
      ref={register}
      className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-2"
    >
      {children}
    </div>
  );
}

/** Colour swatches, size picker, quantity and the add-to-cart button. */
export function PurchasePanel({ purchase, onAdded, registerCta }: PurchasePanelProps) {
  const t = useTranslations('product');
  const format = useFormat();
  const uid = useId();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const [guideOpen, setGuideOpen] = useState(false);

  const { product, color, sizes, size, sizeError } = purchase;
  const productSoldOut = isProductSoldOut(product);
  const colorSoldOut = !colorHasStock(color);
  const colorName = format.text(color.name);
  const errorId = `${uid}-size-error`;
  const statusId = `${uid}-size-status`;
  const selected = sizes.find((s) => s.size === size);
  const selectedLevel = selected ? stockLevel(selected.stock) : null;

  const submit = () => {
    const result = purchase.submit();
    if (result === 'needs-size') purchase.focusSizes();
    if (result === 'added' || result === 'merged') (onAdded ?? openDrawer)();
  };

  return (
    <div className="flex flex-col gap-7">
      <fieldset>
        <legend className="text-sm">
          <span className="text-ink-500">{t('color')}: </span>
          <span className="font-medium">{colorName}</span>
          {colorSoldOut && !productSoldOut ? (
            <span className="text-ink-500"> — {t('soldOutColor')}</span>
          ) : null}
        </legend>
        <div className="mt-2 flex flex-wrap gap-1">
          {product.colors.map((c) => {
            const out = !colorHasStock(c);
            return (
              <label key={c.id} className="relative cursor-pointer">
                <input
                  type="radio"
                  name={`${uid}-color`}
                  value={c.id}
                  checked={c.id === color.id}
                  onChange={() => purchase.selectColor(c.id)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="grid size-11 place-items-center rounded-full peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-600 peer-checked:[&>span]:ring-2 peer-checked:[&>span]:ring-ink-900 peer-checked:[&>span]:ring-offset-2 peer-checked:[&>span]:ring-offset-paper"
                >
                  <span
                    className={`size-8 rounded-full border border-sand-300 ${out ? 'strike-diagonal text-ink-500' : ''}`}
                    style={{ backgroundColor: c.hex }}
                  />
                </span>
                <span className="sr-only">
                  {format.text(c.name)}
                  {out ? ` — ${t('soldOutColor')}` : ''}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset aria-describedby={sizeError ? errorId : statusId}>
        <div className="flex items-baseline justify-between gap-4">
          <legend className="text-sm">
            <span className="text-ink-500">{t('size')}: </span>
            <span className="font-medium">
              {size === null ? t('sizeNone') : <bdi>{format.number(size)}</bdi>}
            </span>
          </legend>
          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:text-accent-700"
          >
            <Ruler aria-hidden className="size-4" />
            {t('sizeGuide')}
          </button>
        </div>
        <SizeGrid register={purchase.registerSizeGroup}>
          {sizes.map(({ size: value, stock }) => {
            const level = stockLevel(stock);
            const label =
              level === 'out'
                ? t('sizeOptionOut', { size: format.number(value) })
                : level === 'low'
                  ? t('sizeOptionLow', {
                      size: format.number(value),
                      count: stock,
                      countText: format.number(stock),
                    })
                  : t('sizeOption', { size: format.number(value) });
            return (
              <label key={value} className="relative">
                <input
                  type="radio"
                  name={`${uid}-size`}
                  value={value}
                  disabled={level === 'out'}
                  checked={size === value}
                  onChange={() => purchase.selectSize(value)}
                  aria-label={label}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className={`grid min-h-12 cursor-pointer place-items-center rounded-sm border text-sm font-medium transition-colors dur-fast peer-checked:border-ink-900 peer-checked:bg-ink-900 peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-600 ${
                    level === 'out'
                      ? 'strike-diagonal cursor-not-allowed border-sand-200 bg-canvas text-ink-400'
                      : level === 'low'
                        ? 'border-dashed border-ink-500 hover:border-ink-900'
                        : 'border-sand-300 hover:border-ink-900'
                  }`}
                >
                  <bdi>{format.number(value)}</bdi>
                </span>
              </label>
            );
          })}
        </SizeGrid>
        <p id={statusId} aria-live="polite" className="mt-3 min-h-5 text-sm text-ink-700">
          {selected && selectedLevel === 'low'
            ? t('lowStockNote', { count: selected.stock, countText: format.number(selected.stock) })
            : selected
              ? t('inStockNote')
              : null}
        </p>
        {sizeError ? (
          <p id={errorId} role="alert" className="text-sm font-medium text-danger-600">
            {t('chooseSize')}
          </p>
        ) : null}
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="size-4 rounded-xs border border-dashed border-ink-500" />
            {t('legendLow')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="strike-diagonal size-4 rounded-xs border border-sand-200 bg-canvas text-ink-400"
            />
            {t('legendOut')}
          </span>
        </p>
      </fieldset>

      {productSoldOut || colorSoldOut ? (
        <p role="status" className="rounded-md bg-warning-100 px-4 py-3 text-sm text-warning-700">
          {productSoldOut ? t('soldOutProduct') : t('soldOutColorHint')}
        </p>
      ) : null}

      <div ref={registerCta} className="flex flex-wrap items-center gap-3">
        {productSoldOut || colorSoldOut ? null : (
          <QuantityStepper
            value={purchase.quantity}
            max={purchase.maxQuantity}
            onChange={purchase.setQuantity}
          />
        )}
        <Button
          size="lg"
          className="min-w-0 flex-1"
          disabled={productSoldOut || colorSoldOut}
          onClick={submit}
        >
          {productSoldOut || colorSoldOut ? t('soldOut') : t('addToCart')}
        </Button>
      </div>

      <SizeGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  );
}

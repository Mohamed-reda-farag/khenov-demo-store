'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import type { CatalogFacets } from '@/data/repository';
import type { Category } from '@/data/types';
import { useFormat } from '@/lib/hooks/useFormat';
import type { ShopScope, ShopState } from './shop-params';

interface FilterFieldsProps {
  state: ShopState;
  scope: ShopScope;
  facets: CatalogFacets;
  categories: readonly Category[];
  onChange: (patch: Partial<ShopState>) => void;
}

const toggle = <T,>(items: readonly T[], item: T): T[] =>
  items.includes(item) ? items.filter((i) => i !== item) : [...items, item];

const groupTitle = 'mb-2 text-sm font-semibold';
const rowClass = 'flex min-h-11 cursor-pointer items-center gap-3 text-sm';

function PriceInput({
  label,
  value,
  placeholder,
  onCommit,
}: {
  label: string;
  value: number | undefined;
  placeholder: string;
  onCommit: (value: number | undefined) => void;
}) {
  const id = useId();
  const [text, setText] = useState(value === undefined ? '' : String(value));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const commitRef = useRef(onCommit);
  useEffect(() => {
    commitRef.current = onCommit;
  });

  // Follow the URL when it changes from elsewhere (clear all, back button).
  const [seen, setSeen] = useState(value);
  if (value !== seen) {
    setSeen(value);
    setText(value === undefined ? '' : String(value));
  }

  const parse = (raw: string): number | undefined => {
    const digits = raw.replace(/\D/g, '');
    return digits ? Number(digits) : undefined;
  };

  const flush = (raw: string) => {
    if (timer.current) clearTimeout(timer.current);
    commitRef.current(parse(raw));
  };

  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1 block text-xs text-ink-500">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        dir="ltr"
        value={text}
        placeholder={placeholder}
        onChange={(event) => {
          const raw = event.target.value;
          setText(raw);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => commitRef.current(parse(raw)), 500);
        }}
        onBlur={() => flush(text)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            flush(text);
          }
        }}
        className="h-11 w-full rounded-sm border border-sand-300 bg-paper px-3 text-sm"
      />
    </div>
  );
}

/** The filter controls, shared by the desktop sidebar and the mobile sheet. */
export function FilterFields({ state, scope, facets, categories, onChange }: FilterFieldsProps) {
  const t = useTranslations('shop');
  const format = useFormat();
  const sizes = [...new Set([...facets.sizes.map((s) => s.size), ...state.sizes])].sort(
    (a, b) => a - b,
  );
  const sizeCount = (size: number) => facets.sizes.find((s) => s.size === size)?.count ?? 0;

  return (
    <div className="flex flex-col gap-7">
      {scope.kind !== 'category' ? (
        <fieldset>
          <legend className={groupTitle}>{t('filterCategory')}</legend>
          {facets.categories.map((facet) => {
            const category = categories.find((c) => c.id === facet.id);
            const checked = state.categories.includes(facet.id);
            return (
              <label key={facet.id} className={rowClass}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={facet.count === 0 && !checked}
                  onChange={() => onChange({ categories: toggle(state.categories, facet.id) })}
                  className="size-5 accent-accent-600"
                />
                <span className="flex-1">{category ? format.text(category.name) : facet.id}</span>
                <span className="text-ink-500">{format.number(facet.count)}</span>
              </label>
            );
          })}
        </fieldset>
      ) : null}

      <fieldset>
        <legend className={groupTitle}>{t('filterSize')}</legend>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2">
          {sizes.map((size) => {
            const checked = state.sizes.includes(size);
            const count = sizeCount(size);
            return (
              <label key={size} className="relative">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange({ sizes: toggle(state.sizes, size) })}
                  aria-label={t('sizeOption', {
                    size: format.number(size),
                    count,
                    countText: format.number(count),
                  })}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="grid min-h-11 cursor-pointer place-items-center rounded-sm border border-sand-300 text-sm font-medium peer-checked:border-ink-900 peer-checked:bg-ink-900 peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-600"
                >
                  <bdi>{format.number(size)}</bdi>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className={groupTitle}>{t('filterColor')}</legend>
        {facets.colors.map(({ color, count }) => {
          const checked = state.colors.includes(color.id);
          return (
            <label key={color.id} className={rowClass}>
              <input
                type="checkbox"
                checked={checked}
                disabled={count === 0 && !checked}
                onChange={() => onChange({ colors: toggle(state.colors, color.id) })}
                className="size-5 accent-accent-600"
              />
              <span
                aria-hidden
                className="size-5 rounded-full border border-sand-300"
                style={{ backgroundColor: color.hex }}
              />
              <span className="flex-1">{format.text(color.name)}</span>
              <span className="text-ink-500">{format.number(count)}</span>
            </label>
          );
        })}
      </fieldset>

      <fieldset>
        <legend className={groupTitle}>{t('filterPrice')}</legend>
        <div className="flex items-end gap-3">
          <PriceInput
            label={t('priceMin')}
            value={state.minPrice}
            placeholder={format.number(Math.floor(facets.price.min / 50) * 50)}
            onCommit={(minPrice) => onChange({ minPrice })}
          />
          <span aria-hidden className="pb-3 text-ink-500">
            –
          </span>
          <PriceInput
            label={t('priceMax')}
            value={state.maxPrice}
            placeholder={format.number(Math.ceil(facets.price.max / 50) * 50)}
            onCommit={(maxPrice) => onChange({ maxPrice })}
          />
        </div>
        <p className="mt-1 text-xs text-ink-500">{t('priceHint')}</p>
      </fieldset>

      <fieldset>
        <legend className={groupTitle}>{t('filterAvailability')}</legend>
        <label className={rowClass}>
          <input
            type="checkbox"
            checked={state.inStock}
            onChange={() => onChange({ inStock: !state.inStock })}
            className="size-5 accent-accent-600"
          />
          {t('inStockOnly')}
        </label>
      </fieldset>
    </div>
  );
}

'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CatalogFacets } from '@/data/repository';
import type { Category } from '@/data/types';
import { useFormat } from '@/lib/hooks/useFormat';
import type { ShopScope, ShopState } from './shop-params';

interface ActiveFiltersProps {
  state: ShopState;
  scope: ShopScope;
  facets: CatalogFacets;
  categories: readonly Category[];
  onChange: (patch: Partial<ShopState>) => void;
  onClearAll: () => void;
}

function Chip({
  label,
  remove,
  onRemove,
}: {
  label: string;
  remove: string;
  onRemove: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onRemove}
        aria-label={remove}
        className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-sand-300 bg-paper ps-4 pe-3 text-sm hover:border-ink-900"
      >
        {label}
        <X aria-hidden className="size-4" />
      </button>
    </li>
  );
}

/** One removable chip per active filter, plus "Clear all". */
export function ActiveFilters({
  state,
  scope,
  facets,
  categories,
  onChange,
  onClearAll,
}: ActiveFiltersProps) {
  const t = useTranslations('shop');
  const format = useFormat();
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (state.q) {
    chips.push({
      key: 'q',
      label: t('chipSearch', { text: state.q }),
      onRemove: () => onChange({ q: '' }),
    });
  }
  if (scope.kind !== 'category') {
    for (const id of state.categories) {
      const category = categories.find((c) => c.id === id);
      chips.push({
        key: `category-${id}`,
        label: category ? format.text(category.name) : id,
        onRemove: () => onChange({ categories: state.categories.filter((c) => c !== id) }),
      });
    }
  }
  for (const size of state.sizes) {
    chips.push({
      key: `size-${size}`,
      label: t('chipSize', { size: format.number(size) }),
      onRemove: () => onChange({ sizes: state.sizes.filter((s) => s !== size) }),
    });
  }
  for (const id of state.colors) {
    const color = facets.colors.find((c) => c.color.id === id)?.color;
    chips.push({
      key: `color-${id}`,
      label: color ? format.text(color.name) : id,
      onRemove: () => onChange({ colors: state.colors.filter((c) => c !== id) }),
    });
  }
  if (state.minPrice !== undefined || state.maxPrice !== undefined) {
    const label =
      state.minPrice !== undefined && state.maxPrice !== undefined
        ? t('chipPriceBetween', {
            min: format.price(state.minPrice),
            max: format.price(state.maxPrice),
          })
        : state.minPrice !== undefined
          ? t('chipPriceFrom', { min: format.price(state.minPrice) })
          : t('chipPriceUpTo', { max: format.price(state.maxPrice ?? 0) });
    chips.push({
      key: 'price',
      label,
      onRemove: () => onChange({ minPrice: undefined, maxPrice: undefined }),
    });
  }
  if (state.inStock) {
    chips.push({
      key: 'stock',
      label: t('inStockOnly'),
      onRemove: () => onChange({ inStock: false }),
    });
  }
  if (state.onSale) {
    chips.push({ key: 'sale', label: t('chipSale'), onRemove: () => onChange({ onSale: false }) });
  }
  if (state.onlyNew) {
    chips.push({ key: 'new', label: t('chipNew'), onRemove: () => onChange({ onlyNew: false }) });
  }

  if (chips.length === 0) return null;

  return (
    <ul aria-label={t('activeFilters')} className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          remove={t('removeFilter', { label: chip.label })}
          onRemove={chip.onRemove}
        />
      ))}
      <li>
        <button
          type="button"
          onClick={onClearAll}
          className="inline-flex min-h-11 items-center px-3 text-sm font-medium underline underline-offset-4 hover:text-accent-700"
        >
          {t('clearAll')}
        </button>
      </li>
    </ul>
  );
}

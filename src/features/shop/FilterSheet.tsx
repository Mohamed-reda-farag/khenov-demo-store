'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { catalogRepository, type CatalogFacets } from '@/data/repository';
import type { Category } from '@/data/types';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';
import { FilterFields } from './FilterFields';
import {
  clearFilters,
  serializeShopParams,
  toCatalogQuery,
  withPageReset,
  type ShopScope,
  type ShopState,
} from './shop-params';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  /** The applied filters (from the URL). The sheet edits a private draft of them. */
  applied: ShopState;
  scope: ShopScope;
  facets: CatalogFacets;
  categories: readonly Category[];
  onApply: (state: ShopState) => void;
}

function SheetBody({
  applied,
  scope,
  facets,
  categories,
  onApply,
  onClose,
}: Omit<FilterSheetProps, 'open'>) {
  const t = useTranslations('shop');
  const format = useFormat();
  const [draft, setDraft] = useState<ShopState>(() => withPageReset(applied));

  // The "Apply (N results)" number is asked of the repository, like any other read.
  const key = `count:${serializeShopParams(draft, scope)}`;
  const count = useAsync(key, () =>
    catalogRepository.list({ ...toCatalogQuery(draft, scope), page: 1, pageSize: 1 }),
  );
  const draftFacets =
    count.status === 'success'
      ? count.data.facets
      : count.status === 'loading'
        ? (count.previous?.facets ?? facets)
        : facets;

  const total =
    count.status === 'success'
      ? count.data.total
      : count.status === 'loading'
        ? count.previous?.total
        : undefined;
  const label =
    count.status === 'error'
      ? t('applyNoCount')
      : total === undefined
        ? t('applyLoading')
        : t('apply', { count: total, countText: format.number(total) });

  return (
    <>
      <div className="px-5 py-5">
        <FilterFields
          state={draft}
          scope={scope}
          facets={draftFacets}
          categories={categories}
          onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
        />
      </div>
      <div className="sticky bottom-0 flex gap-3 border-t border-sand-200 bg-paper px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Button variant="secondary" onClick={() => setDraft(clearFilters(draft))}>
          {t('clearAll')}
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
        >
          <span aria-live="polite">{label}</span>
        </Button>
      </div>
    </>
  );
}

/** Phone filter UI: edits a draft and applies it in one go, so the list does not reload per tap. */
export function FilterSheet({ open, onClose, ...rest }: FilterSheetProps) {
  const t = useTranslations('shop');
  return (
    <Modal open={open} onClose={onClose} title={t('filters')} size="md">
      <SheetBody {...rest} onClose={onClose} />
    </Modal>
  );
}

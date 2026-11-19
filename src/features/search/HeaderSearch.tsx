'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { IconButton } from '@/components/ui/IconButton';
/** The panel (and its search logic) is fetched the first time the icon is used, not with every page. */
const SearchOverlay = dynamic(() => import('./SearchOverlay').then((m) => m.SearchOverlay), {
  ssr: false,
});

/** The header's search icon; the panel is mounted only while it is open. */
export function HeaderSearch() {
  const t = useTranslations('header');
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton label={t('search')} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <Search aria-hidden className="size-5" />
      </IconButton>
      {open ? <SearchOverlay onClose={() => setOpen(false)} /> : null}
    </>
  );
}

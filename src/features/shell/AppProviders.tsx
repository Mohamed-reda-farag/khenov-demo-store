'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, type ReactNode } from 'react';
import './boot';
import { Toaster } from '@/components/ui/Toaster';
import { useOverlayStore } from '@/components/ui/overlay';
import { toast } from '@/components/ui/toast';
import { preferencesRepository } from '@/data/repository';
import { LOCALES } from '@/data/types';
import { CartDrawer } from '@/features/cart/CartDrawer';
import { useCartStore } from '@/features/cart/cart.store';
import { ResetDemoDialog } from '@/features/demo/ResetDemo';
import { onDemoReset } from '@/lib/demo';
import { MobileNavDrawer } from './MobileNavDrawer';

/**
 * Client root: hydrates stores, remembers the language, and renders everything that must live
 * OUTSIDE the inert app shell (overlays and toasts) so they stay interactive while it is locked.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const t = useTranslations('cart');
  const overlayCount = useOverlayStore((s) => s.count);
  const hydrate = useCartStore((s) => s.hydrate);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const syncErrors = useCartStore((s) => s.syncErrors);

  useEffect(() => {
    void hydrate();
    return onDemoReset(() => {
      closeDrawer();
      void hydrate();
    });
  }, [hydrate, closeDrawer]);

  useEffect(() => {
    const known = LOCALES.find((l) => l === locale);
    if (known) preferencesRepository.setLocale(known);
  }, [locale]);

  useEffect(() => {
    document.documentElement.classList.toggle('overlay-open', overlayCount > 0);
  }, [overlayCount]);

  useEffect(() => {
    if (syncErrors > 0) toast.error(t('updateFailed'));
  }, [syncErrors, t]);

  return (
    <>
      <div id="app-shell" inert={overlayCount > 0}>
        {children}
      </div>
      <MobileNavDrawer />
      <CartDrawer />
      <ResetDemoDialog />
      <Toaster />
    </>
  );
}

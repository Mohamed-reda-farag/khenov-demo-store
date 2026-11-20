'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, type ReactNode } from 'react';
import './boot';
import { Toaster } from '@/components/ui/Toaster';
import { useOverlayStore } from '@/components/ui/overlay';
import { toast } from '@/components/ui/toast';
import { preferencesRepository } from '@/data/repository';
import { LOCALES } from '@/data/types';
import { useCartStore } from '@/features/cart/cart.store';
import { useDemoUiStore } from '@/features/demo/demo-ui.store';
import { useWishlistStore } from '@/features/wishlist/wishlist.store';
import { useEverTrue } from '@/lib/hooks/useEverTrue';
import { onDemoReset } from '@/lib/demo';
import { CartDrawer, MobileNavDrawer, ResetDemoDialog } from './lazy-overlays';
import { useMobileNavStore } from './nav';

/**
 * Client root: hydrates stores, remembers the language, and renders everything that must live
 * OUTSIDE the inert app shell (overlays and toasts) so they stay interactive while it is locked.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const t = useTranslations('cart');
  const tWishlist = useTranslations('wishlist');
  const overlayCount = useOverlayStore((s) => s.count);
  const cartMounted = useEverTrue(useCartStore((s) => s.drawerOpen));
  const navMounted = useEverTrue(useMobileNavStore((s) => s.open));
  const resetMounted = useEverTrue(useDemoUiStore((s) => s.resetOpen));
  const hydrate = useCartStore((s) => s.hydrate);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const syncErrors = useCartStore((s) => s.syncErrors);
  const hydrateWishlist = useWishlistStore((s) => s.hydrate);
  const wishlistErrors = useWishlistStore((s) => s.syncErrors);

  useEffect(() => {
    void hydrate();
    void hydrateWishlist();
    return onDemoReset(() => {
      closeDrawer();
      void hydrate();
      void hydrateWishlist();
    });
  }, [hydrate, hydrateWishlist, closeDrawer]);

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

  useEffect(() => {
    if (wishlistErrors > 0) toast.error(tWishlist('updateFailed'));
  }, [wishlistErrors, tWishlist]);

  return (
    <>
      <div id="app-shell" inert={overlayCount > 0}>
        {children}
      </div>
      {navMounted ? <MobileNavDrawer /> : null}
      {cartMounted ? <CartDrawer /> : null}
      {resetMounted ? <ResetDemoDialog /> : null}
      <Toaster />
    </>
  );
}

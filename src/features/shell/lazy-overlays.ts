import dynamic from 'next/dynamic';

/**
 * Overlays that most visits never open are separate chunks: they are fetched the first time the
 * visitor points at, focuses or touches the control that opens them (`preload*`), or when it opens.
 */
const loadCartDrawer = () => import('@/features/cart/CartDrawer').then((m) => m.CartDrawer);
const loadMobileNav = () => import('./MobileNavDrawer').then((m) => m.MobileNavDrawer);
const loadResetDialog = () => import('@/features/demo/ResetDemo').then((m) => m.ResetDemoDialog);

export const CartDrawer = dynamic(loadCartDrawer, { ssr: false });
export const MobileNavDrawer = dynamic(loadMobileNav, { ssr: false });
export const ResetDemoDialog = dynamic(loadResetDialog, { ssr: false });

export const preloadCartDrawer = (): void => void loadCartDrawer();
export const preloadMobileNav = (): void => void loadMobileNav();
export const preloadResetDialog = (): void => void loadResetDialog();

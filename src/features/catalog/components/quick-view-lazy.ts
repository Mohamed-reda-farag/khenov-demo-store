import dynamic from 'next/dynamic';

/** The quick-view dialog is its own chunk: it is fetched when a card is focused or first opened. */
const loadQuickView = () => import('@/features/product/QuickView').then((m) => m.QuickView);

export const QuickView = dynamic(loadQuickView, { ssr: false });
export const preloadQuickView = (): void => void loadQuickView();

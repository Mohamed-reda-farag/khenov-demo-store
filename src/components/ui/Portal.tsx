'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const subscribe = () => () => {};

/**
 * Renders into <body>, outside the app shell. Overlays must live there: the shell goes `inert`
 * while one is open, which would also lock an overlay rendered inside it.
 */
export function Portal({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return isClient ? createPortal(children, document.body) : null;
}

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';

/**
 * After a client-side navigation, moves focus to the new page's heading (or the main area) so
 * keyboard and screen-reader users start at the top of the new content instead of on a link that
 * no longer exists. The first load and query-only changes (filters, sorting) leave focus alone.
 */
export function RouteFocus() {
  const pathname = usePathname();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const main = document.getElementById('main');
    if (!main) return;
    const heading = main.querySelector<HTMLElement>('h1');
    const target = heading ?? main;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}

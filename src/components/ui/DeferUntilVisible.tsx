'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Renders `children` only once the spot is near the viewport. Sections far below the fold then
 * neither download their code and data nor run their effects while the page is loading.
 * `minHeight` keeps the page length stable so nothing jumps when the section appears.
 */
export function DeferUntilVisible({
  children,
  minHeight,
  margin = '600px',
}: {
  children: ReactNode;
  minHeight: string;
  /** How early to start, measured from the edge of the viewport. */
  margin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisible(true);
      },
      { rootMargin: margin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible, margin]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}

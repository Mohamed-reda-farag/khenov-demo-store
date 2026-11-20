'use client';

import { useState } from 'react';

/**
 * Count bubble for the header icons. It pops (transform only) when the number goes up after the
 * page has loaded; restoring a saved count on load stays still. Hidden from assistive tech: the
 * button's own label already carries the count.
 */
export function CountBadge({
  count,
  text,
  ready,
}: {
  count: number;
  text: string;
  ready: boolean;
}) {
  const [seen, setSeen] = useState(count);
  const [pops, setPops] = useState(0);
  if (count !== seen) {
    setSeen(count);
    if (ready && count > seen) setPops(pops + 1);
  }
  if (count === 0) return null;

  return (
    <span
      key={pops}
      aria-hidden
      className={`absolute end-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-accent-600 px-1 text-[0.6875rem] leading-5 font-semibold text-white ${
        pops > 0 ? 'pop' : ''
      }`}
    >
      {text}
    </span>
  );
}

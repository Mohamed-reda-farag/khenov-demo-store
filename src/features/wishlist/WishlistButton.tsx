'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useWishlistStore } from './wishlist.store';

/** Heart toggle. `aria-pressed` carries the state so it never relies on the fill colour alone. */
export function WishlistButton({
  productId,
  colorId,
  name,
  className = '',
}: {
  productId: string;
  /** The colour on screen; remembered so the wishlist shows its photo. */
  colorId: string;
  name: string;
  className?: string;
}) {
  const t = useTranslations('wishlist');
  const saved = useWishlistStore((s) => s.entries.some((e) => e.productId === productId));
  const toggle = useWishlistStore((s) => s.toggle);
  // The heart only pops when the shopper saves it, never when saved items load.
  const [popped, setPopped] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={t(saved ? 'remove' : 'add', { name })}
      onClick={() => {
        setPopped(!saved);
        toggle(productId, colorId);
      }}
      className={`grid size-11 place-items-center rounded-full bg-paper/90 text-ink-900 shadow-soft transition-transform dur-fast ease-brand hover:bg-paper active:scale-90 ${className}`}
    >
      <Heart
        aria-hidden
        className={`size-5 ${saved ? 'fill-accent-600 text-accent-600' : ''} ${saved && popped ? 'pop' : ''}`}
      />
    </button>
  );
}

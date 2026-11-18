'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useWishlistStore } from './wishlist.store';

/** Heart toggle. `aria-pressed` carries the state so it never relies on the fill colour alone. */
export function WishlistButton({
  productId,
  name,
  className = '',
}: {
  productId: string;
  name: string;
  className?: string;
}) {
  const t = useTranslations('wishlist');
  const saved = useWishlistStore((s) => s.ids.includes(productId));
  const toggle = useWishlistStore((s) => s.toggle);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={t(saved ? 'remove' : 'add', { name })}
      onClick={() => toggle(productId)}
      className={`grid size-11 place-items-center rounded-full bg-paper/90 text-ink-900 shadow-soft transition-transform dur-fast ease-brand hover:bg-paper active:scale-90 ${className}`}
    >
      <Heart aria-hidden className={`size-5 ${saved ? 'fill-accent-600 text-accent-600' : ''}`} />
    </button>
  );
}

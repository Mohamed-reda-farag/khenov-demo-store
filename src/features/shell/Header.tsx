'use client';

import { Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { IconButton, iconButtonClasses } from '@/components/ui/IconButton';
import { Wordmark } from '@/components/ui/Wordmark';
import { itemCount } from '@/features/cart/cart.logic';
import { useCartStore } from '@/features/cart/cart.store';
import { Link } from '@/i18n/navigation';
import { useFormat } from '@/lib/hooks/useFormat';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MegaNav } from './MegaNav';
import { useMobileNavStore } from './nav';

function CartButton() {
  const t = useTranslations('header');
  const format = useFormat();
  const count = useCartStore((s) => itemCount(s.lines));
  const open = useCartStore((s) => s.openDrawer);
  return (
    <IconButton
      label={t('cartLabel', { count, countText: format.number(count) })}
      onClick={open}
      aria-haspopup="dialog"
    >
      <ShoppingBag aria-hidden className="size-5" />
      {count > 0 ? (
        <span
          aria-hidden
          className="absolute end-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-accent-600 px-1 text-[0.6875rem] leading-5 font-semibold text-white"
        >
          {format.number(count)}
        </span>
      ) : null}
    </IconButton>
  );
}

export function Header() {
  const t = useTranslations('header');
  const nav = useTranslations('nav');
  const setMobileOpen = useMobileNavStore((s) => s.setOpen);

  return (
    <header className="sticky top-0 z-header border-b border-sand-200 bg-paper">
      <div className="container-page relative flex h-16 items-center justify-between gap-2 lg:h-20">
        <div className="flex items-center gap-1">
          <IconButton label={nav('menu')} className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu aria-hidden className="size-5" />
          </IconButton>
          <Wordmark />
        </div>

        <MegaNav />

        <div className="flex items-center gap-0.5">
          <Link href="/search" aria-label={t('search')} className={iconButtonClasses}>
            <Search aria-hidden className="size-5" />
          </Link>
          <Link
            href="/wishlist"
            aria-label={t('wishlist')}
            className={`${iconButtonClasses} max-sm:hidden`}
          >
            <Heart aria-hidden className="size-5" />
          </Link>
          <Link
            href="/account"
            aria-label={t('account')}
            className={`${iconButtonClasses} max-sm:hidden`}
          >
            <User aria-hidden className="size-5" />
          </Link>
          <LanguageSwitcher className="max-sm:hidden" />
          <CartButton />
        </div>
      </div>
    </header>
  );
}

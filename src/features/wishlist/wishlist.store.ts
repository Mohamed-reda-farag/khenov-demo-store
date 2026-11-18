'use client';

import { create } from 'zustand';
import { wishlistRepository } from '@/data/repository';

interface WishlistState {
  ids: string[];
  hydrated: boolean;
  /** Incremented when a background save failed and the list was rolled back. */
  syncErrors: number;
  hydrate: () => Promise<void>;
  /** Returns whether the product is now in the wishlist. */
  toggle: (productId: string) => boolean;
}

let saveQueue: Promise<void> = Promise.resolve();

export const useWishlistStore = create<WishlistState>((set, get) => ({
  ids: [],
  hydrated: false,
  syncErrors: 0,

  hydrate: async () => {
    const ids = await wishlistRepository.load();
    set({ ids, hydrated: true });
  },

  toggle: (productId) => {
    const current = get().ids;
    const has = current.includes(productId);
    const ids = has ? current.filter((id) => id !== productId) : [...current, productId];
    set({ ids });
    saveQueue = saveQueue
      .then(() => wishlistRepository.save(ids))
      .catch(async () => {
        const persisted = await wishlistRepository.load();
        set((s) => ({ ids: persisted, syncErrors: s.syncErrors + 1 }));
      });
    return !has;
  },
}));

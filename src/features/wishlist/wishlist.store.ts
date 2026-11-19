'use client';

import { create } from 'zustand';
import { wishlistRepository } from '@/data/repository';
import type { WishlistEntry } from '@/data/types';

interface WishlistState {
  entries: WishlistEntry[];
  hydrated: boolean;
  /** Incremented when a background save failed and the list was rolled back. */
  syncErrors: number;
  hydrate: () => Promise<void>;
  /** Adds the product (remembering the colour), or removes it. Returns whether it is now saved. */
  toggle: (productId: string, colorId: string) => boolean;
  /** Adds the product when it is not saved yet. Returns whether it was added. */
  add: (productId: string, colorId: string) => boolean;
  remove: (productId: string) => WishlistEntry | null;
  /** Puts a removed entry back at its old position (Undo). */
  restore: (entry: WishlistEntry, index: number) => void;
}

let saveQueue: Promise<void> = Promise.resolve();

export const useWishlistStore = create<WishlistState>((set, get) => {
  /** Optimistic update: state changes immediately; persistence follows in the background. */
  const commit = (entries: WishlistEntry[]) => {
    set({ entries });
    saveQueue = saveQueue
      .then(() => wishlistRepository.save(entries))
      .catch(async () => {
        const persisted = await wishlistRepository.load();
        set((s) => ({ entries: persisted, syncErrors: s.syncErrors + 1 }));
      });
  };

  return {
    entries: [],
    hydrated: false,
    syncErrors: 0,

    hydrate: async () => {
      const entries = await wishlistRepository.load();
      set({ entries, hydrated: true });
    },

    toggle: (productId, colorId) => {
      const saved = get().entries.some((e) => e.productId === productId);
      if (saved) {
        get().remove(productId);
        return false;
      }
      get().add(productId, colorId);
      return true;
    },

    add: (productId, colorId) => {
      const current = get().entries;
      if (current.some((e) => e.productId === productId)) return false;
      commit([...current, { productId, colorId }]);
      return true;
    },

    remove: (productId) => {
      const current = get().entries;
      const entry = current.find((e) => e.productId === productId);
      if (!entry) return null;
      commit(current.filter((e) => e.productId !== productId));
      return entry;
    },

    restore: (entry, index) => {
      const current = get().entries;
      if (current.some((e) => e.productId === entry.productId)) return;
      const next = [...current];
      next.splice(Math.min(Math.max(0, index), next.length), 0, entry);
      commit(next);
    },
  };
});

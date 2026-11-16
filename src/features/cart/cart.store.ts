'use client';

import { create } from 'zustand';
import { cartRepository } from '@/data/repository';
import type { CartLine, Product } from '@/data/types';
import {
  addLine,
  buildLine,
  removeLine,
  restoreLine,
  setLineQuantity,
  type AddResult,
} from './cart.logic';

interface CartState {
  lines: CartLine[];
  hydrated: boolean;
  drawerOpen: boolean;
  /** Incremented when a background save failed and the cart was rolled back. */
  syncErrors: number;
  hydrate: () => Promise<void>;
  add: (product: Product, colorId: string, size: number) => AddResult | 'unavailable';
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => { line: CartLine; index: number } | null;
  restore: (line: CartLine, index: number) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

/** Saves are queued so rapid taps are persisted in order and never interleave. */
let saveQueue: Promise<void> = Promise.resolve();

export const useCartStore = create<CartState>((set, get) => {
  /** Optimistic update: state changes immediately; persistence follows in the background. */
  const commit = (lines: CartLine[]) => {
    set({ lines });
    saveQueue = saveQueue
      .then(() => cartRepository.save(lines))
      .catch(async () => {
        const persisted = await cartRepository.load();
        set((s) => ({ lines: persisted, syncErrors: s.syncErrors + 1 }));
      });
  };

  return {
    lines: [],
    hydrated: false,
    drawerOpen: false,
    syncErrors: 0,

    hydrate: async () => {
      const lines = await cartRepository.load();
      set({ lines, hydrated: true });
    },

    add: (product, colorId, size) => {
      const line = buildLine(product, colorId, size);
      if (!line) return 'unavailable';
      const { lines, result } = addLine(get().lines, line);
      if (result !== 'capped') commit(lines);
      return result;
    },

    setQuantity: (id, quantity) => commit(setLineQuantity(get().lines, id, quantity)),

    remove: (id) => {
      const lines = get().lines;
      const index = lines.findIndex((l) => l.id === id);
      const line = lines[index];
      if (!line) return null;
      commit(removeLine(lines, id));
      return { line, index };
    },

    restore: (line, index) => commit(restoreLine(get().lines, line, index)),

    openDrawer: () => set({ drawerOpen: true }),
    closeDrawer: () => set({ drawerOpen: false }),
  };
});

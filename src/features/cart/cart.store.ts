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
  /** The most recent add, kept so the drawer can offer Undo. */
  lastAdded: LastAdded | null;
  hydrate: () => Promise<void>;
  add: (
    product: Product,
    colorId: string,
    size: number,
    quantity?: number,
  ) => AddResult | 'unavailable';
  undoAdd: () => void;
  clearLastAdded: () => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => { line: CartLine; index: number } | null;
  restore: (line: CartLine, index: number) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export interface LastAdded {
  /** Changes with every add so a notice can restart its timer. */
  token: number;
  line: CartLine;
  /** Cart contents before the add, restored by Undo. */
  previous: CartLine[];
}

let addToken = 0;

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
    lastAdded: null,

    hydrate: async () => {
      const lines = await cartRepository.load();
      set({ lines, hydrated: true });
    },

    add: (product, colorId, size, quantity = 1) => {
      const line = buildLine(product, colorId, size, quantity);
      if (!line) return 'unavailable';
      const previous = get().lines;
      const { lines, result } = addLine(previous, line);
      if (result === 'capped') return result;
      commit(lines);
      addToken += 1;
      set({ lastAdded: { token: addToken, line, previous } });
      return result;
    },

    undoAdd: () => {
      const last = get().lastAdded;
      if (!last) return;
      set({ lastAdded: null });
      commit(last.previous);
    },

    clearLastAdded: () => set({ lastAdded: null }),

    setQuantity: (id, quantity) => {
      set({ lastAdded: null });
      commit(setLineQuantity(get().lines, id, quantity));
    },

    remove: (id) => {
      const lines = get().lines;
      const index = lines.findIndex((l) => l.id === id);
      const line = lines[index];
      if (!line) return null;
      set({ lastAdded: null });
      commit(removeLine(lines, id));
      return { line, index };
    },

    restore: (line, index) => {
      set({ lastAdded: null });
      commit(restoreLine(get().lines, line, index));
    },

    openDrawer: () => set({ drawerOpen: true }),
    closeDrawer: () => set({ drawerOpen: false, lastAdded: null }),
  };
});

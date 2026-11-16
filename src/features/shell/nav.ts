'use client';

import { create } from 'zustand';
import { catalogRepository } from '@/data/repository';
import type { Banner, Category, Collection } from '@/data/types';

export interface NavData {
  categories: Category[];
  collections: Collection[];
  promo: Banner | null;
}

let cached: Promise<NavData> | null = null;

/** Shared by the mega-nav and the mobile menu; a failed load is not cached so Retry works. */
export function loadNavData(): Promise<NavData> {
  cached ??= Promise.all([
    catalogRepository.listCategories(),
    catalogRepository.listCollections(),
    catalogRepository.listBanners(),
  ])
    .then(([categories, collections, banners]) => ({
      categories,
      collections,
      promo: banners.find((b) => b.kind === 'tile') ?? null,
    }))
    .catch((error: unknown) => {
      cached = null;
      throw error;
    });
  return cached;
}

interface MobileNavState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useMobileNavStore = create<MobileNavState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));

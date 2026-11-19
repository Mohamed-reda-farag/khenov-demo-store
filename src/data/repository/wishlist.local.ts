import { simulateNetwork } from '@/lib/demo/network';
import { registerSeeder } from '@/lib/demo/seed';
import { storage } from '@/lib/demo/storage';
import type { WishlistEntry } from '../types';
import type { WishlistRepository } from './wishlist';

const KEY = 'wishlist';

registerSeeder(() => {
  storage.set<WishlistEntry[]>(KEY, []);
});

export const localWishlistRepository: WishlistRepository = {
  async load() {
    return storage.get<WishlistEntry[]>(KEY, []);
  },

  async save(entries) {
    await simulateNetwork(80, 240);
    storage.set(KEY, entries);
  },
};

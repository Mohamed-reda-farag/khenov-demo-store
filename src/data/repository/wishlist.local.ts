import { simulateNetwork } from '@/lib/demo/network';
import { registerSeeder } from '@/lib/demo/seed';
import { storage } from '@/lib/demo/storage';
import type { WishlistRepository } from './wishlist';

const KEY = 'wishlist';

registerSeeder(() => {
  storage.set<string[]>(KEY, []);
});

export const localWishlistRepository: WishlistRepository = {
  async load() {
    return storage.get<string[]>(KEY, []);
  },

  async save(ids) {
    await simulateNetwork(80, 240);
    storage.set(KEY, ids);
  },
};

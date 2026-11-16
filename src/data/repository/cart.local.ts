import { simulateNetwork } from '@/lib/demo/network';
import { registerSeeder } from '@/lib/demo/seed';
import { storage } from '@/lib/demo/storage';
import type { CartLine } from '../types';
import type { CartRepository } from './cart';

const KEY = 'cart';

registerSeeder(() => {
  storage.set<CartLine[]>(KEY, []);
});

export const localCartRepository: CartRepository = {
  /** Reading local state is instant; only writes pay the simulated network cost. */
  async load() {
    return storage.get<CartLine[]>(KEY, []);
  },

  async save(lines) {
    await simulateNetwork(120, 360);
    storage.set(KEY, lines);
  },
};

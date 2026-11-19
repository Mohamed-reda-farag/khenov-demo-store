import { simulateNetwork } from '@/lib/demo/network';
import { registerSeeder } from '@/lib/demo/seed';
import { storage } from '@/lib/demo/storage';
import { removeAddress, upsertAddress } from '../rules/addresses';
import type { Address } from '../types';
import type { AddressesRepository } from './addresses';

const KEY = 'addresses';

registerSeeder(() => {
  storage.set<Address[]>(KEY, []);
});

export const localAddressesRepository: AddressesRepository = {
  async list() {
    await simulateNetwork(120, 360);
    return storage.get<Address[]>(KEY, []);
  },

  async save(input) {
    await simulateNetwork(200, 500);
    const { list, saved } = upsertAddress(
      storage.get<Address[]>(KEY, []),
      input,
      () => `addr-${Date.now().toString(36)}`,
    );
    storage.set(KEY, list);
    return saved;
  },

  async remove(id) {
    await simulateNetwork(150, 400);
    storage.set(KEY, removeAddress(storage.get<Address[]>(KEY, []), id));
  },
};

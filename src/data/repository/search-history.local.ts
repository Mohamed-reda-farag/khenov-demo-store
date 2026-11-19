import { registerSeeder } from '@/lib/demo/seed';
import { storage } from '@/lib/demo/storage';
import { pushRecentSearch, removeRecentSearch } from '../rules/search-history';
import type { SearchHistoryRepository } from './search-history';

const KEY = 'recentSearches';

registerSeeder(() => {
  storage.set<string[]>(KEY, []);
});

/** Recent searches are the visitor's own notes: reading and writing them is instant. */
export const localSearchHistoryRepository: SearchHistoryRepository = {
  async list() {
    return storage.get<string[]>(KEY, []);
  },

  async add(term) {
    storage.set(KEY, pushRecentSearch(storage.get<string[]>(KEY, []), term));
  },

  async remove(term) {
    storage.set(KEY, removeRecentSearch(storage.get<string[]>(KEY, []), term));
  },

  async clear() {
    storage.set<string[]>(KEY, []);
  },
};

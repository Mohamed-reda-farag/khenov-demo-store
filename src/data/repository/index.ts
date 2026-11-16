import { localCartRepository } from './cart.local';
import { localCatalogRepository } from './catalog.local';
import { localPreferencesRepository } from './preferences';

/**
 * The only way UI code reads or writes data. To swap in a real API later,
 * replace these three assignments — nothing else changes.
 */
export const catalogRepository = localCatalogRepository;
export const cartRepository = localCartRepository;
export const preferencesRepository = localPreferencesRepository;

export type { CartRepository } from './cart';
export type {
  CatalogFacets,
  CatalogPage,
  CatalogQuery,
  CatalogRepository,
  SortKey,
  Suggestion,
} from './catalog';
export type { PreferencesRepository } from './preferences';

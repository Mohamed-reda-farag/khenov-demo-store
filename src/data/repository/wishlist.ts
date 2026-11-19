import type { WishlistEntry } from '../types';

/** Hearted products, in the order they were added. */
export interface WishlistRepository {
  load(): Promise<WishlistEntry[]>;
  save(entries: readonly WishlistEntry[]): Promise<void>;
}

import type { CartLine } from '../types';

/**
 * Persists the cart. Business rules (merging, stock caps) live in
 * features/cart/cart.logic.ts; the repository only loads and saves.
 */
export interface CartRepository {
  load(): Promise<CartLine[]>;
  save(lines: readonly CartLine[]): Promise<void>;
}

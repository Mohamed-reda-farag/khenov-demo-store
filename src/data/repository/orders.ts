import type { PlaceOrderInput } from '../rules/place-order';
import type { Order } from '../types';

export interface OrdersRepository {
  /** Newest first. */
  list(): Promise<Order[]>;
  get(id: string): Promise<Order | null>;
  /** Validates stock, promo and payment, then stores the order. Throws OrderError. */
  place(input: PlaceOrderInput): Promise<Order>;
  /** Throws OrderError('NOT_FOUND' | 'NOT_CANCELLABLE'). */
  cancel(id: string): Promise<Order>;
  /** Throws OrderError('NOT_FOUND' | 'UNDO_EXPIRED'). */
  undoCancel(id: string): Promise<Order>;
}

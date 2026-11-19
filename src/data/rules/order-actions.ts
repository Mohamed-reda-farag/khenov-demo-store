import type { Order } from '../types';
import { canCancel, canUndoCancel } from './order-status';
import { OrderError } from './place-order';

/** Marks the order cancelled. Only allowed while it is being processed. */
export function cancelOrder(order: Order, now: Date): Order {
  if (!canCancel(order, now)) throw new OrderError('NOT_CANCELLABLE');
  return { ...order, cancelledAt: now.toISOString() };
}

/** Reverses a cancellation made a moment ago. */
export function undoCancelOrder(order: Order, now: Date): Order {
  if (!canUndoCancel(order, now)) throw new OrderError('UNDO_EXPIRED');
  const restored: Order = { ...order };
  delete restored.cancelledAt;
  return restored;
}

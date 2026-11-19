import type { Order, OrderStatus } from '../types';

/** Steps of the simulated timeline, in order (a cancelled order leaves it). */
export const TIMELINE_STEPS = ['placed', 'processing', 'shipped', 'delivered'] as const;
export type TimelineStep = (typeof TIMELINE_STEPS)[number];

const SECOND = 1000;
const MINUTE = 60 * SECOND;

/**
 * When each step starts, measured from the moment the order was placed. Compressed to minutes
 * so a demo visitor can watch the order progress (a real shop would use days).
 */
export const STEP_OFFSETS_MS: Readonly<Record<TimelineStep, number>> = {
  placed: 0,
  processing: 30 * SECOND,
  shipped: 10 * MINUTE,
  delivered: 40 * MINUTE,
};

/** How long after cancelling the visitor can still undo it. */
export const UNDO_CANCEL_MS = 10 * SECOND;

type Timed = Pick<Order, 'createdAt' | 'cancelledAt'>;

export function stepTime(order: Timed, step: TimelineStep): Date {
  return new Date(new Date(order.createdAt).getTime() + STEP_OFFSETS_MS[step]);
}

export function orderStatus(order: Timed, now: Date): OrderStatus {
  if (order.cancelledAt) return 'cancelled';
  const elapsed = now.getTime() - new Date(order.createdAt).getTime();
  let current: TimelineStep = 'placed';
  for (const step of TIMELINE_STEPS) {
    if (elapsed >= STEP_OFFSETS_MS[step]) current = step;
  }
  return current;
}

/** Orders can only be cancelled while they are being processed. */
export const canCancel = (order: Timed, now: Date): boolean =>
  orderStatus(order, now) === 'processing';

export function canUndoCancel(order: Timed, now: Date): boolean {
  if (!order.cancelledAt) return false;
  return now.getTime() - new Date(order.cancelledAt).getTime() <= UNDO_CANCEL_MS;
}

/** The next moment the status changes by itself (null once delivered or cancelled). */
export function nextStatusChange(order: Timed, now: Date): Date | null {
  if (order.cancelledAt) return null;
  for (const step of TIMELINE_STEPS) {
    const at = stepTime(order, step);
    if (at.getTime() > now.getTime()) return at;
  }
  return null;
}

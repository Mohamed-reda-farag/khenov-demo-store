import { simulateNetwork } from '@/lib/demo/network';
import { registerSeeder } from '@/lib/demo/seed';
import { storage } from '@/lib/demo/storage';
import { cancelOrder, undoCancelOrder } from '../rules/order-actions';
import { OrderError, buildOrder } from '../rules/place-order';
import type { Order } from '../types';
import type { OrdersRepository } from './orders';

const ORDERS_KEY = 'orders';
const SEQUENCE_KEY = 'orderSequence';

registerSeeder(() => {
  storage.set<Order[]>(ORDERS_KEY, []);
  storage.set<number>(SEQUENCE_KEY, 0);
});

const read = (): Order[] => storage.get<Order[]>(ORDERS_KEY, []);

/** Replaces one stored order with the result of `change`, or throws NOT_FOUND. */
function update(id: string, change: (order: Order, now: Date) => Order): Order {
  const orders = read();
  const found = orders.find((o) => o.id === id);
  if (!found) throw new OrderError('NOT_FOUND');
  const next = change(found, new Date());
  storage.set(
    ORDERS_KEY,
    orders.map((o) => (o.id === id ? next : o)),
  );
  return next;
}

/**
 * Orders live in localStorage. Placing one does not reduce the catalogue's stock, so the demo
 * can be repeated forever; stock is still checked on every placement.
 */
export const localOrdersRepository: OrdersRepository = {
  async list() {
    await simulateNetwork(150, 450);
    return [...read()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async get(id) {
    await simulateNetwork(150, 450);
    return read().find((o) => o.id === id) ?? null;
  },

  async place(input) {
    // Pretend to talk to a payment processor; ?demo=error fails here, before anything is stored.
    await simulateNetwork(900, 1800);
    const { PRODUCTS } = await import('../seed');
    const sequence = storage.get<number>(SEQUENCE_KEY, 0);
    const order = buildOrder(input, PRODUCTS, new Date(), sequence);
    storage.set(ORDERS_KEY, [order, ...read()]);
    storage.set(SEQUENCE_KEY, sequence + 1);
    return order;
  },

  async cancel(id) {
    await simulateNetwork(250, 600);
    return update(id, cancelOrder);
  },

  async undoCancel(id) {
    await simulateNetwork(150, 400);
    return update(id, undoCancelOrder);
  },
};

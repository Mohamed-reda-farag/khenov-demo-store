import { describe, expect, it } from 'vitest';
import { buildLine } from '@/features/cart/cart.logic';
import { colorHasStock } from '../stock';
import { TEST_PRODUCTS } from '../testing';
import type { CartLine, Product } from '../types';
import { checkLines, isBlocking, issuesFor } from './line-check';
import { cancelOrder, undoCancelOrder } from './order-actions';
import {
  canCancel,
  canUndoCancel,
  nextStatusChange,
  orderStatus,
  STEP_OFFSETS_MS,
  UNDO_CANCEL_MS,
} from './order-status';
import { formatOrderId, normalizeOrderId } from './order-id';
import { buildOrder, OrderError, type PlaceOrderInput } from './place-order';

const NOW = new Date('2026-11-19T10:00:00Z');
const product = TEST_PRODUCTS.find((p) => p.slug === 'nile-low')!;
const color = product.colors.find(colorHasStock)!;
const size = color.sizes.find((s) => s.stock >= 4)!.size;
const soldOutColor = product.colors.find((c) => !colorHasStock(c))!;

function line(quantity = 1): CartLine {
  return buildLine(product, color.id, size, quantity)!;
}

const base = (over: Partial<PlaceOrderInput> = {}): PlaceOrderInput => ({
  lines: [line(2)],
  contact: { email: 'a@example.com', phone: '01012345678' },
  shipping: {
    fullName: 'Test Person',
    governorate: 'cairo',
    city: 'Nasr City',
    street: '12 Test St',
    notes: '',
  },
  shippingMethod: 'standard',
  payment: { method: 'cod' },
  ...over,
});

describe('checkLines', () => {
  it('finds nothing wrong with a healthy cart', () => {
    expect(checkLines([line()], TEST_PRODUCTS)).toEqual([]);
  });

  it('flags a colour that became unavailable', () => {
    const stale: CartLine = { ...line(), colorId: soldOutColor.id, id: 'x' };
    expect(checkLines([stale], TEST_PRODUCTS)).toEqual([{ kind: 'unavailable', lineId: 'x' }]);
  });

  it('flags a product that no longer exists', () => {
    const ghost: CartLine = { ...line(), productId: 'gone', id: 'g' };
    expect(checkLines([ghost], TEST_PRODUCTS)[0]).toMatchObject({ kind: 'unavailable' });
  });

  it('reports how many pairs are left when the quantity is too high', () => {
    const stock = color.sizes.find((s) => s.size === size)!.stock;
    const greedy: CartLine = { ...line(), quantity: stock + 2 };
    expect(checkLines([greedy], TEST_PRODUCTS)).toEqual([
      { kind: 'insufficient', lineId: greedy.id, available: stock },
    ]);
  });

  it('treats a price change as a notice, not a blocker', () => {
    const old: CartLine = { ...line(), unitPriceEGP: product.priceEGP - 100 };
    const issues = checkLines([old], TEST_PRODUCTS);
    expect(issues[0]).toMatchObject({ kind: 'price-changed', from: product.priceEGP - 100 });
    expect(issues.filter(isBlocking)).toEqual([]);
    expect(issuesFor(issues, old.id)).toHaveLength(1);
  });
});

describe('buildOrder', () => {
  it('builds a priced order from the catalogue, not from the cart prices', () => {
    const cheap: CartLine = { ...line(2), unitPriceEGP: 1 };
    const order = buildOrder(base({ lines: [cheap] }), TEST_PRODUCTS, NOW, 0);
    expect(order.id).toBe('ATR-10001');
    expect(order.lines[0]?.unitPriceEGP).toBe(product.priceEGP);
    expect(order.totals.subtotal).toBe(product.priceEGP * 2);
    expect(order.createdAt).toBe(NOW.toISOString());
    expect(order.paymentMethod).toBe('cod');
    expect(order.cancelledAt).toBeUndefined();
  });

  it('records the promo code and its discount', () => {
    const order = buildOrder(base({ promoCode: 'athar10' }), TEST_PRODUCTS, NOW, 4);
    expect(order.promoCode).toBe('ATHAR10');
    expect(order.totals.discount).toBe(Math.floor(order.totals.subtotal / 10));
    expect(order.id).toBe('ATR-10005');
  });

  it('refuses an empty cart', () => {
    expect(() => buildOrder(base({ lines: [] }), TEST_PRODUCTS, NOW, 0)).toThrowError(OrderError);
    try {
      buildOrder(base({ lines: [] }), TEST_PRODUCTS, NOW, 0);
    } catch (error) {
      expect((error as OrderError).code).toBe('EMPTY_CART');
    }
  });

  it('refuses stale stock and lists the lines at fault', () => {
    const stale: CartLine = { ...line(), colorId: soldOutColor.id, id: 'stale' };
    try {
      buildOrder(base({ lines: [stale] }), TEST_PRODUCTS, NOW, 0);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(OrderError);
      expect((error as OrderError).code).toBe('STOCK_CHANGED');
      expect((error as OrderError).issues).toEqual([{ kind: 'unavailable', lineId: 'stale' }]);
    }
  });

  it('refuses an invalid or expired promo code', () => {
    for (const promoCode of ['NOPE', 'SUMMER25']) {
      expect(() => buildOrder(base({ promoCode }), TEST_PRODUCTS, NOW, 0)).toThrowError(
        expect.objectContaining({ code: 'PROMO_INVALID' }),
      );
    }
  });

  it('refuses a declined card but accepts an approved one', () => {
    expect(() =>
      buildOrder(base({ payment: { method: 'card', outcome: 'declined' } }), TEST_PRODUCTS, NOW, 0),
    ).toThrowError(expect.objectContaining({ code: 'PAYMENT_DECLINED' }));
    const order = buildOrder(
      base({ payment: { method: 'card', outcome: 'approved' } }),
      TEST_PRODUCTS,
      NOW,
      0,
    );
    expect(order.paymentMethod).toBe('card');
    expect(JSON.stringify(order)).not.toMatch(/outcome|approved|cvc|expiry/i);
  });

  it('checks stock before the payment outcome', () => {
    const stale: CartLine = { ...line(), colorId: soldOutColor.id };
    expect(() =>
      buildOrder(
        base({ lines: [stale], payment: { method: 'card', outcome: 'declined' } }),
        TEST_PRODUCTS,
        NOW,
        0,
      ),
    ).toThrowError(expect.objectContaining({ code: 'STOCK_CHANGED' }));
  });

  it('does not mutate the catalogue it is given', () => {
    const copy: Product[] = structuredClone([...TEST_PRODUCTS]);
    buildOrder(base(), copy, NOW, 0);
    expect(copy).toEqual(TEST_PRODUCTS);
  });
});

describe('order status from timestamps', () => {
  const order = { createdAt: NOW.toISOString() };
  const at = (ms: number) => new Date(NOW.getTime() + ms);

  it('advances placed → processing → shipped → delivered with elapsed time', () => {
    expect(orderStatus(order, at(0))).toBe('placed');
    expect(orderStatus(order, at(STEP_OFFSETS_MS.processing - 1))).toBe('placed');
    expect(orderStatus(order, at(STEP_OFFSETS_MS.processing))).toBe('processing');
    expect(orderStatus(order, at(STEP_OFFSETS_MS.shipped))).toBe('shipped');
    expect(orderStatus(order, at(STEP_OFFSETS_MS.delivered))).toBe('delivered');
    expect(orderStatus(order, at(10 * STEP_OFFSETS_MS.delivered))).toBe('delivered');
  });

  it('a cancelled order stays cancelled', () => {
    const cancelled = { ...order, cancelledAt: at(60_000).toISOString() };
    expect(orderStatus(cancelled, at(STEP_OFFSETS_MS.delivered))).toBe('cancelled');
  });

  it('can be cancelled only while processing', () => {
    expect(canCancel(order, at(0))).toBe(false);
    expect(canCancel(order, at(STEP_OFFSETS_MS.processing))).toBe(true);
    expect(canCancel(order, at(STEP_OFFSETS_MS.shipped))).toBe(false);
    expect(canCancel({ ...order, cancelledAt: at(60_000).toISOString() }, at(61_000))).toBe(false);
  });

  it('allows undoing a cancellation for a short window only', () => {
    const cancelled = { ...order, cancelledAt: at(60_000).toISOString() };
    expect(canUndoCancel(cancelled, at(60_000 + UNDO_CANCEL_MS))).toBe(true);
    expect(canUndoCancel(cancelled, at(60_000 + UNDO_CANCEL_MS + 1))).toBe(false);
    expect(canUndoCancel(order, at(0))).toBe(false);
  });

  it('tells when the next step starts', () => {
    expect(nextStatusChange(order, at(0))?.getTime()).toBe(
      at(STEP_OFFSETS_MS.processing).getTime(),
    );
    expect(nextStatusChange(order, at(STEP_OFFSETS_MS.delivered))).toBeNull();
    expect(nextStatusChange({ ...order, cancelledAt: NOW.toISOString() }, at(0))).toBeNull();
  });
});

describe('order ids', () => {
  it('counts up from ATR-10001', () => {
    expect(formatOrderId(0)).toBe('ATR-10001');
    expect(formatOrderId(41)).toBe('ATR-10042');
  });

  it('normalises what a visitor might type', () => {
    expect(normalizeOrderId(' atr-10042 ')).toBe('ATR-10042');
    expect(normalizeOrderId('ATR10042')).toBe('ATR-10042');
    expect(normalizeOrderId('hello')).toBeNull();
    expect(normalizeOrderId('ATR-12')).toBeNull();
  });
});

describe('cancel and undo', () => {
  const placed = { ...buildOrder(base(), TEST_PRODUCTS, NOW, 0) };
  const processing = new Date(NOW.getTime() + STEP_OFFSETS_MS.processing + 1000);

  it('cancels a processing order and stamps the time', () => {
    const cancelled = cancelOrder(placed, processing);
    expect(cancelled.cancelledAt).toBe(processing.toISOString());
    expect(orderStatus(cancelled, processing)).toBe('cancelled');
  });

  it('refuses to cancel before processing starts or after it ships', () => {
    const tooEarly = new Date(NOW.getTime() + 1000);
    const shipped = new Date(NOW.getTime() + STEP_OFFSETS_MS.shipped);
    for (const when of [tooEarly, shipped]) {
      expect(() => cancelOrder(placed, when)).toThrowError(
        expect.objectContaining({ code: 'NOT_CANCELLABLE' }),
      );
    }
  });

  it('undo brings the order back inside the window and fails after it', () => {
    const cancelled = cancelOrder(placed, processing);
    const restored = undoCancelOrder(cancelled, new Date(processing.getTime() + 5000));
    expect('cancelledAt' in restored).toBe(false);
    expect(orderStatus(restored, processing)).toBe('processing');
    expect(() =>
      undoCancelOrder(cancelled, new Date(processing.getTime() + UNDO_CANCEL_MS + 1)),
    ).toThrowError(expect.objectContaining({ code: 'UNDO_EXPIRED' }));
  });
});

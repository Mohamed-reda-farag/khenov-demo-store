import { MAX_PER_LINE } from '../limits';
import type { CartLine, Order, PaymentMethod, Product, ShippingMethodId } from '../types';
import { checkLines, isBlocking, type LineIssue } from './line-check';
import { formatOrderId } from './order-id';
import { evaluatePromo } from './promo';
import { computeTotals } from './totals';
import type { ChargeOutcome } from './card';

export type OrderErrorCode =
  | 'EMPTY_CART'
  | 'STOCK_CHANGED'
  | 'PROMO_INVALID'
  | 'PAYMENT_DECLINED'
  | 'NOT_FOUND'
  | 'NOT_CANCELLABLE'
  | 'UNDO_EXPIRED';

/** Why an order was refused. `issues` lists the cart lines at fault for STOCK_CHANGED. */
export class OrderError extends Error {
  readonly code: OrderErrorCode;
  readonly issues: readonly LineIssue[];

  constructor(code: OrderErrorCode, issues: readonly LineIssue[] = []) {
    super(code);
    this.name = 'OrderError';
    this.code = code;
    this.issues = issues;
  }
}

export type PaymentInput =
  | { method: Extract<PaymentMethod, 'cod'> }
  /** The charge was already simulated in the browser; no card details are passed on. */
  | { method: Extract<PaymentMethod, 'card'>; outcome: ChargeOutcome };

export interface PlaceOrderInput {
  lines: readonly CartLine[];
  contact: Order['contact'];
  shipping: Order['shipping'];
  shippingMethod: ShippingMethodId;
  payment: PaymentInput;
  promoCode?: string | undefined;
}

/**
 * Validates and prices an order against the current catalogue. Throws OrderError, in this
 * order of checks: empty cart, stock, promo code, payment. Prices come from the catalogue,
 * never from the cart lines the browser sent.
 */
export function buildOrder(
  input: PlaceOrderInput,
  products: readonly Product[],
  now: Date,
  sequence: number,
): Order {
  if (input.lines.length === 0) throw new OrderError('EMPTY_CART');

  const blocking = checkLines(input.lines, products).filter(isBlocking);
  if (blocking.length > 0) throw new OrderError('STOCK_CHANGED', blocking);

  const lines: CartLine[] = input.lines.map((line) => {
    const price = products.find((p) => p.id === line.productId)?.priceEGP ?? line.unitPriceEGP;
    return { ...line, unitPriceEGP: price, maxQuantity: Math.min(line.maxQuantity, MAX_PER_LINE) };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPriceEGP, 0);

  const promo = input.promoCode ? evaluatePromo(input.promoCode, subtotal, now) : null;
  if (promo && !promo.ok) throw new OrderError('PROMO_INVALID');

  if (input.payment.method === 'card' && input.payment.outcome === 'declined') {
    throw new OrderError('PAYMENT_DECLINED');
  }

  const {
    subtotal: s,
    discount,
    shipping,
    total,
  } = computeTotals(subtotal, input.shippingMethod, promo);
  return {
    id: formatOrderId(sequence),
    createdAt: now.toISOString(),
    lines,
    contact: input.contact,
    shipping: input.shipping,
    shippingMethod: input.shippingMethod,
    paymentMethod: input.payment.method,
    ...(promo?.ok ? { promoCode: promo.promo.code } : {}),
    totals: { subtotal: s, discount, shipping, total },
  };
}

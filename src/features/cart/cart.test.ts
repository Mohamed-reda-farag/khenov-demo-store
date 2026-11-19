// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { TEST_PRODUCTS as PRODUCTS } from '@/data/testing';
import { colorHasStock } from '@/data/stock';
import { ensureSeeded, resetDemo } from '@/lib/demo';
import { setFlagsForTest } from '@/lib/demo/flags';
import {
  addLine,
  buildLine,
  itemCount,
  reorderLines,
  removeLine,
  restoreLine,
  setLineQuantity,
  subtotal,
} from './cart.logic';
import { useCartStore } from './cart.store';
import { cartRepository } from '@/data/repository';

const product = PRODUCTS.find((p) => p.slug === 'nile-low')!;
const color = product.colors.find(colorHasStock)!;
const inStock = color.sizes.find((s) => s.stock > 3)!;
const soldOut = PRODUCTS.flatMap((p) =>
  p.colors.flatMap((c) => c.sizes.filter((s) => s.stock === 0).map((s) => ({ p, c, s }))),
)[0]!;

describe('cart logic', () => {
  it('builds a line only for an available colour + size', () => {
    expect(buildLine(product, color.id, inStock.size)).not.toBeNull();
    expect(buildLine(soldOut.p, soldOut.c.id, soldOut.s.size)).toBeNull();
    expect(buildLine(product, 'no-such-color', inStock.size)).toBeNull();
  });

  it('merges identical lines and caps at the available quantity', () => {
    const line = buildLine(product, color.id, inStock.size)!;
    let lines = addLine([], line).lines;
    expect(addLine(lines, line).result).toBe('merged');
    for (let i = 0; i < 20; i += 1) lines = addLine(lines, line).lines;
    expect(lines[0]?.quantity).toBe(line.maxQuantity);
    expect(addLine(lines, line).result).toBe('capped');
  });

  it('adds several at once, clamped to stock, and merges the quantity', () => {
    const three = buildLine(product, color.id, inStock.size, 3)!;
    expect(three.quantity).toBe(3);
    expect(buildLine(product, color.id, inStock.size, 999)?.quantity).toBe(three.maxQuantity);
    const merged = addLine(addLine([], three).lines, three);
    expect(merged.result).toBe('merged');
    expect(merged.lines[0]?.quantity).toBe(Math.min(6, three.maxQuantity));
  });

  it('stock differs per colour: a sold-out colour cannot be added', () => {
    const dune = PRODUCTS.find((p) => p.slug === 'dune-court')!;
    const ivory = dune.colors.find((c) => c.id === 'ivory')!;
    expect(colorHasStock(ivory)).toBe(false);
    expect(buildLine(dune, 'ivory', 42)).toBeNull();
    const sand = dune.colors.find((c) => c.id === 'sand')!;
    expect(colorHasStock(sand)).toBe(true);
  });

  it('clamps quantity, removes, restores at the same position, and totals', () => {
    const a = buildLine(product, color.id, inStock.size)!;
    const other = PRODUCTS.find((p) => p.slug === 'sahel-slide')!;
    const otherColor = other.colors.find(colorHasStock)!;
    const b = buildLine(other, otherColor.id, otherColor.sizes.find((s) => s.stock > 3)!.size)!;
    let lines = addLine(addLine([], a).lines, b).lines;

    lines = setLineQuantity(lines, a.id, 3);
    expect(setLineQuantity(lines, a.id, 0)[0]?.quantity).toBe(1);
    expect(setLineQuantity(lines, a.id, 999)[0]?.quantity).toBe(a.maxQuantity);
    expect(itemCount(lines)).toBe(4);
    expect(subtotal(lines)).toBe(3 * product.priceEGP + other.priceEGP);

    const removed = removeLine(lines, a.id);
    expect(removed).toHaveLength(1);
    const restored = restoreLine(removed, lines[0]!, 0);
    expect(restored.map((l) => l.id)).toEqual(lines.map((l) => l.id));
    expect(restoreLine(restored, lines[0]!, 0)).toHaveLength(2);
  });
});

describe('cart store + repository', () => {
  beforeEach(() => {
    window.localStorage.clear();
    setFlagsForTest(['fast']);
    ensureSeeded();
    useCartStore.setState({
      lines: [],
      hydrated: false,
      drawerOpen: false,
      syncErrors: 0,
      lastAdded: null,
    });
  });

  it('updates optimistically and persists, so a reload restores the cart', async () => {
    useCartStore.getState().add(product, color.id, inStock.size);
    expect(useCartStore.getState().lines).toHaveLength(1);
    await new Promise((r) => setTimeout(r, 20));

    useCartStore.setState({ lines: [] });
    await useCartStore.getState().hydrate();
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().hydrated).toBe(true);
  });

  it('Undo after an add restores the previous cart', async () => {
    const store = useCartStore.getState();
    store.add(product, color.id, inStock.size);
    expect(useCartStore.getState().lastAdded?.line.productId).toBe(product.id);
    useCartStore.getState().undoAdd();
    expect(useCartStore.getState().lines).toEqual([]);
    expect(useCartStore.getState().lastAdded).toBeNull();
    await new Promise((r) => setTimeout(r, 20));
    expect(await cartRepository.load()).toEqual([]);
  });

  it('rolls back to the last saved cart and flags an error when saving fails', async () => {
    useCartStore.getState().add(product, color.id, inStock.size);
    await new Promise((r) => setTimeout(r, 20));

    setFlagsForTest(['fast', 'error']);
    useCartStore.getState().setQuantity(useCartStore.getState().lines[0]!.id, 3);
    expect(useCartStore.getState().lines[0]?.quantity).toBe(3);
    await new Promise((r) => setTimeout(r, 20));

    expect(useCartStore.getState().lines[0]?.quantity).toBe(1);
    expect(useCartStore.getState().syncErrors).toBe(1);
  });

  it('resetDemo() empties the persisted cart', async () => {
    useCartStore.getState().add(product, color.id, inStock.size);
    await new Promise((r) => setTimeout(r, 20));
    resetDemo();
    expect(await cartRepository.load()).toEqual([]);
  });
});

describe('reorderLines', () => {
  const product = PRODUCTS.find((p) => p.slug === 'nile-low')!;
  const color = product.colors.find(colorHasStock)!;
  const size = color.sizes.find((s) => s.stock >= 2)!.size;
  const soldOutColor = product.colors.find((c) => !colorHasStock(c))!;

  it('rebuilds lines with current price and stock', () => {
    const old = { ...buildLine(product, color.id, size, 2)!, unitPriceEGP: 1, maxQuantity: 99 };
    const { lines, skipped } = reorderLines([old], PRODUCTS);
    expect(skipped).toEqual([]);
    expect(lines[0]).toMatchObject({ unitPriceEGP: product.priceEGP, quantity: 2 });
    expect(lines[0]!.maxQuantity).toBeLessThan(99);
  });

  it('skips lines that can no longer be bought and caps quantities to stock', () => {
    const gone = {
      ...buildLine(product, color.id, size, 1)!,
      colorId: soldOutColor.id,
      id: 'gone',
    };
    const greedy = { ...buildLine(product, color.id, size, 1)!, quantity: 50 };
    const { lines, skipped } = reorderLines([gone, greedy], PRODUCTS);
    expect(skipped.map((l) => l.id)).toEqual(['gone']);
    expect(lines).toHaveLength(1);
    expect(lines[0]!.quantity).toBeLessThanOrEqual(10);
    expect(lines[0]!.quantity).toBeLessThanOrEqual(lines[0]!.maxQuantity);
  });
});

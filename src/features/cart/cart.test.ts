// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { PRODUCTS } from '@/data/seed';
import { ensureSeeded, resetDemo } from '@/lib/demo';
import { setFlagsForTest } from '@/lib/demo/flags';
import {
  addLine,
  buildLine,
  itemCount,
  removeLine,
  restoreLine,
  setLineQuantity,
  subtotal,
} from './cart.logic';
import { useCartStore } from './cart.store';
import { cartRepository } from '@/data/repository';

const product = PRODUCTS.find((p) => p.slug === 'nile-low')!;
const inStock = product.sizes.find((s) => s.stock > 3)!;
const soldOut = PRODUCTS.flatMap((p) => p.sizes.map((s) => ({ p, s }))).find(
  ({ s }) => s.stock === 0,
)!;

describe('cart logic', () => {
  it('builds a line only for an available colour + size', () => {
    expect(buildLine(product, product.colors[0]!.id, inStock.size)).not.toBeNull();
    expect(buildLine(soldOut.p, soldOut.p.colors[0]!.id, soldOut.s.size)).toBeNull();
    expect(buildLine(product, 'no-such-color', inStock.size)).toBeNull();
  });

  it('merges identical lines and caps at the available quantity', () => {
    const line = buildLine(product, product.colors[0]!.id, inStock.size)!;
    let lines = addLine([], line).lines;
    expect(addLine(lines, line).result).toBe('merged');
    for (let i = 0; i < 20; i += 1) lines = addLine(lines, line).lines;
    expect(lines[0]?.quantity).toBe(line.maxQuantity);
    expect(addLine(lines, line).result).toBe('capped');
  });

  it('clamps quantity, removes, restores at the same position, and totals', () => {
    const a = buildLine(product, product.colors[0]!.id, inStock.size)!;
    const other = PRODUCTS.find((p) => p.slug === 'sahel-slide')!;
    const b = buildLine(other, other.colors[0]!.id, other.sizes.find((s) => s.stock > 3)!.size)!;
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
    useCartStore.setState({ lines: [], hydrated: false, drawerOpen: false, syncErrors: 0 });
  });

  it('updates optimistically and persists, so a reload restores the cart', async () => {
    useCartStore.getState().add(product, product.colors[0]!.id, inStock.size);
    expect(useCartStore.getState().lines).toHaveLength(1);
    await new Promise((r) => setTimeout(r, 20));

    useCartStore.setState({ lines: [] });
    await useCartStore.getState().hydrate();
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().hydrated).toBe(true);
  });

  it('rolls back to the last saved cart and flags an error when saving fails', async () => {
    useCartStore.getState().add(product, product.colors[0]!.id, inStock.size);
    await new Promise((r) => setTimeout(r, 20));

    setFlagsForTest(['fast', 'error']);
    useCartStore.getState().setQuantity(useCartStore.getState().lines[0]!.id, 3);
    expect(useCartStore.getState().lines[0]?.quantity).toBe(3);
    await new Promise((r) => setTimeout(r, 20));

    expect(useCartStore.getState().lines[0]?.quantity).toBe(1);
    expect(useCartStore.getState().syncErrors).toBe(1);
  });

  it('resetDemo() empties the persisted cart', async () => {
    useCartStore.getState().add(product, product.colors[0]!.id, inStock.size);
    await new Promise((r) => setTimeout(r, 20));
    resetDemo();
    expect(await cartRepository.load()).toEqual([]);
  });
});

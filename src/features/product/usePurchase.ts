'use client';

import { useCallback, useState } from 'react';
import { toast } from '@/components/ui/toast';
import { allSizes, defaultColor, findColor, sizeStock } from '@/data/stock';
import type { Product, ProductColor } from '@/data/types';
import { MAX_PER_LINE, maxQuantityFor } from '@/features/cart/cart.logic';
import { useCartStore } from '@/features/cart/cart.store';

export type SubmitResult = 'added' | 'merged' | 'capped' | 'needs-size' | 'unavailable';

export interface Purchase {
  product: Product;
  color: ProductColor;
  sizes: { size: number; stock: number }[];
  size: number | null;
  quantity: number;
  /** Largest quantity for the chosen size (or the per-line cap while no size is chosen). */
  maxQuantity: number;
  /** True after trying to add without a size. */
  sizeError: boolean;
  /** Callback ref for the size picker, so "choose a size" can scroll to it and focus it. */
  registerSizeGroup: (element: HTMLDivElement | null) => void;
  selectColor: (colorId: string) => void;
  selectSize: (size: number) => void;
  setQuantity: (quantity: number) => void;
  /** Adds the selection to the cart. Opening the drawer is up to the caller. */
  submit: () => SubmitResult;
  /** Scrolls to the size picker and focuses it (used when a size is missing). */
  focusSizes: () => void;
}

/** Selection state shared by the product page, the quick view and the sticky buy bar. */
export function usePurchase(product: Product, maxReachedMessage: string): Purchase {
  const [colorId, setColorId] = useState(() => defaultColor(product)?.id ?? '');
  const [size, setSize] = useState<number | null>(null);
  const [quantity, setQuantityState] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [sizeGroup, registerSizeGroup] = useState<HTMLDivElement | null>(null);
  const add = useCartStore((s) => s.add);

  const color = findColor(product, colorId) ?? product.colors[0];
  if (!color) throw new Error(`Product ${product.slug} has no colours`);

  const sizes = allSizes(product).map((s) => ({ size: s, stock: sizeStock(color, s) }));
  const maxQuantity =
    size === null ? MAX_PER_LINE : Math.max(1, maxQuantityFor(product, color.id, size));

  const selectColor = useCallback(
    (nextId: string) => {
      setColorId(nextId);
      if (size === null) return;
      if (sizeStock(findColor(product, nextId), size) <= 0) {
        setSize(null);
      } else {
        setQuantityState((q) => Math.min(q, Math.max(1, maxQuantityFor(product, nextId, size))));
      }
    },
    [product, size],
  );

  const selectSize = useCallback(
    (next: number) => {
      setSize(next);
      setSizeError(false);
      setQuantityState((q) => Math.min(q, Math.max(1, maxQuantityFor(product, colorId, next))));
    },
    [product, colorId],
  );

  const focusSizes = useCallback(() => {
    const group = sizeGroup;
    if (!group) return;
    group.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const target =
      group.querySelector<HTMLElement>('input:checked:not(:disabled)') ??
      group.querySelector<HTMLElement>('input:not(:disabled)');
    target?.focus({ preventScroll: true });
  }, [sizeGroup]);

  const submit = useCallback((): SubmitResult => {
    if (size === null) {
      setSizeError(true);
      return 'needs-size';
    }
    const result = add(product, color.id, size, quantity);
    if (result === 'capped') toast.show({ message: maxReachedMessage });
    return result;
  }, [add, color.id, maxReachedMessage, product, quantity, size]);

  return {
    product,
    color,
    sizes,
    size,
    quantity,
    maxQuantity,
    sizeError,
    registerSizeGroup,
    selectColor,
    selectSize,
    setQuantity: (value) => setQuantityState(Math.min(Math.max(1, value), maxQuantity)),
    submit,
    focusSizes,
  };
}

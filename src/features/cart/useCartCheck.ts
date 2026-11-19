'use client';

import { useMemo } from 'react';
import { catalogRepository } from '@/data/repository';
import { checkLines, type LineIssue } from '@/data/rules/line-check';
import type { CartLine, Product } from '@/data/types';
import { useAsync } from '@/lib/hooks/useAsync';

export interface CartCheck {
  /** 'loading' only until the catalogue answered; the cart itself is already on screen. */
  status: 'loading' | 'ready' | 'error';
  issues: LineIssue[];
  products: readonly Product[];
  retry: () => void;
}

/**
 * Re-checks cart lines against the catalogue (stock, colour availability, price). It reloads
 * when the set of products changes, and re-evaluates instantly when only quantities change.
 */
export function useCartCheck(lines: readonly CartLine[]): CartCheck {
  const ids = useMemo(() => [...new Set(lines.map((l) => l.productId))].sort(), [lines]);
  const state = useAsync(`cart-check:${ids.join(',')}`, () => catalogRepository.getByIds(ids));
  const products = useMemo(() => (state.status === 'success' ? state.data : []), [state]);
  const issues = useMemo(
    () => (state.status === 'success' ? checkLines(lines, state.data) : []),
    [state, lines],
  );
  const retry = state.status === 'loading' ? () => undefined : state.retry;
  return {
    status: state.status === 'success' ? 'ready' : state.status,
    issues,
    products,
    retry,
  };
}

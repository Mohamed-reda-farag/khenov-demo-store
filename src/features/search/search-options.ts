import type { Category, Product } from '@/data/types';
import type { Suggestion } from '@/data/repository';

/** One row of the search listbox. */
export type SearchOption =
  | { kind: 'recent'; id: string; term: string }
  | { kind: 'category'; id: string; category: Category }
  | { kind: 'product'; id: string; product: Product }
  | { kind: 'all'; id: string; term: string };

/** Rows shown for the typed text: matching categories and products, then "see all results". */
export function optionsForText(text: string, suggestions: readonly Suggestion[]): SearchOption[] {
  const term = text.trim();
  if (!term) return [];
  const rows: SearchOption[] = suggestions.map((s) =>
    s.kind === 'category'
      ? { kind: 'category', id: `category-${s.category.id}`, category: s.category }
      : { kind: 'product', id: `product-${s.product.id}`, product: s.product },
  );
  return [...rows, { kind: 'all', id: 'all', term }];
}

/** Rows shown before anything is typed: the visitor's recent searches. */
export function optionsForRecent(recent: readonly string[]): SearchOption[] {
  return recent.map((term, i) => ({ kind: 'recent', id: `recent-${i}`, term }));
}

/** Moves the highlighted row, wrapping at both ends. -1 means "no row highlighted". */
export function moveActive(current: number, delta: 1 | -1, length: number): number {
  if (length <= 0) return -1;
  if (current < 0) return delta === 1 ? 0 : length - 1;
  return (current + delta + length) % length;
}

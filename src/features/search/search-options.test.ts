import { describe, expect, it } from 'vitest';
import { TEST_PRODUCTS } from '@/data/testing';
import type { Suggestion } from '@/data/repository';
import { moveActive, optionsForRecent, optionsForText } from './search-options';

const product = TEST_PRODUCTS[0]!;
const suggestions: Suggestion[] = [{ kind: 'product', product }];

describe('optionsForText', () => {
  it('is empty for blank text', () => {
    expect(optionsForText('   ', suggestions)).toEqual([]);
  });

  it('adds a "see all results" row after the suggestions', () => {
    const rows = optionsForText(' nile ', suggestions);
    expect(rows.map((r) => r.kind)).toEqual(['product', 'all']);
    expect(rows[1]).toMatchObject({ kind: 'all', term: 'nile' });
  });

  it('still offers "see all results" when nothing matched', () => {
    expect(optionsForText('zzz', []).map((r) => r.kind)).toEqual(['all']);
  });
});

describe('optionsForRecent', () => {
  it('lists recent terms in order with unique ids', () => {
    const rows = optionsForRecent(['boots', 'sandals']);
    expect(rows.map((r) => (r.kind === 'recent' ? r.term : ''))).toEqual(['boots', 'sandals']);
    expect(new Set(rows.map((r) => r.id)).size).toBe(2);
  });
});

describe('moveActive', () => {
  it('starts at the first row going down and the last going up', () => {
    expect(moveActive(-1, 1, 3)).toBe(0);
    expect(moveActive(-1, -1, 3)).toBe(2);
  });

  it('wraps at both ends', () => {
    expect(moveActive(2, 1, 3)).toBe(0);
    expect(moveActive(0, -1, 3)).toBe(2);
  });

  it('has nothing to highlight in an empty list', () => {
    expect(moveActive(0, 1, 0)).toBe(-1);
  });
});

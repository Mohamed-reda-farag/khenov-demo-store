import { describe, expect, it } from 'vitest';
import { defaultAddress, removeAddress, upsertAddress, type AddressInput } from './addresses';
import { MAX_RECENT_SEARCHES, pushRecentSearch, removeRecentSearch } from './search-history';

const input = (name: string, over: Partial<AddressInput> = {}): AddressInput => ({
  fullName: name,
  phone: '01012345678',
  governorate: 'cairo',
  city: 'Nasr City',
  street: '1 Test Street',
  notes: '',
  ...over,
});

let counter = 0;
const newId = () => `a${(counter += 1)}`;

describe('saved addresses', () => {
  it('makes the first address the default', () => {
    const { list, saved } = upsertAddress([], input('Home'), newId);
    expect(saved.isDefault).toBe(true);
    expect(list).toHaveLength(1);
  });

  it('keeps one default when another address is marked default', () => {
    const first = upsertAddress([], input('Home'), newId);
    const second = upsertAddress(first.list, input('Work', { isDefault: true }), newId);
    expect(second.list.filter((a) => a.isDefault).map((a) => a.fullName)).toEqual(['Work']);
    const third = upsertAddress(second.list, input('Parents'), newId);
    expect(third.saved.isDefault).toBe(false);
    expect(defaultAddress(third.list)?.fullName).toBe('Work');
  });

  it('edits in place and never leaves the list without a default', () => {
    const { list, saved } = upsertAddress([], input('Home'), newId);
    const edited = upsertAddress(
      list,
      { ...input('Home 2', { isDefault: false }), id: saved.id },
      newId,
    );
    expect(edited.list).toHaveLength(1);
    expect(edited.saved).toMatchObject({ fullName: 'Home 2', isDefault: true });
  });

  it('hands the default to the next address when the default is removed', () => {
    const a = upsertAddress([], input('Home'), newId);
    const b = upsertAddress(a.list, input('Work'), newId);
    const after = removeAddress(b.list, a.saved.id);
    expect(after).toHaveLength(1);
    expect(after[0]?.isDefault).toBe(true);
    expect(removeAddress(after, after[0]!.id)).toEqual([]);
    expect(defaultAddress([])).toBeUndefined();
  });
});

describe('recent searches', () => {
  it('puts the newest first and removes an earlier copy in any case', () => {
    expect(pushRecentSearch(['boots', 'Sandals'], 'sandals')).toEqual(['sandals', 'boots']);
  });

  it('collapses spaces, ignores very short terms and caps the list', () => {
    expect(pushRecentSearch([], '  nile   low ')).toEqual(['nile low']);
    expect(pushRecentSearch(['a b'], 'x')).toEqual(['a b']);
    let list: string[] = [];
    for (let i = 0; i < 10; i += 1) list = pushRecentSearch(list, `term ${i}`);
    expect(list).toHaveLength(MAX_RECENT_SEARCHES);
    expect(list[0]).toBe('term 9');
  });

  it('removes one term', () => {
    expect(removeRecentSearch(['a1', 'b2'], 'a1')).toEqual(['b2']);
  });
});

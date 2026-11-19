import type { Address } from '../types';

export type AddressInput = Omit<Address, 'id' | 'isDefault'> & { id?: string; isDefault?: boolean };

/**
 * Adds or replaces an address and keeps exactly one default: the first address ever saved
 * becomes the default, and marking another one as default moves the flag.
 */
export function upsertAddress(
  list: readonly Address[],
  input: AddressInput,
  newId: () => string,
): { list: Address[]; saved: Address } {
  const existing = input.id ? list.find((a) => a.id === input.id) : undefined;
  const makeDefault = list.length === 0 || (input.isDefault ?? existing?.isDefault ?? false);
  const saved: Address = { ...input, id: existing?.id ?? newId(), isDefault: makeDefault };
  const demote = (a: Address): Address => (makeDefault ? { ...a, isDefault: false } : a);

  const next = existing
    ? list.map((a) => (a.id === saved.id ? saved : demote(a)))
    : [...list.map(demote), saved];
  const ensured = ensureDefault(next);
  return { list: ensured, saved: ensured.find((a) => a.id === saved.id) ?? saved };
}

/** Removes an address; the oldest remaining one becomes the default if the default was removed. */
export function removeAddress(list: readonly Address[], id: string): Address[] {
  return ensureDefault(list.filter((a) => a.id !== id));
}

function ensureDefault(list: Address[]): Address[] {
  if (list.length === 0 || list.some((a) => a.isDefault)) return list;
  return list.map((a, i) => (i === 0 ? { ...a, isDefault: true } : a));
}

/** The address checkout should offer first. */
export const defaultAddress = (list: readonly Address[]): Address | undefined =>
  list.find((a) => a.isDefault) ?? list[0];

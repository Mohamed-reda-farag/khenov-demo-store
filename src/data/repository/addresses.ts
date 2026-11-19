import type { AddressInput } from '../rules/addresses';
import type { Address } from '../types';

export interface AddressesRepository {
  list(): Promise<Address[]>;
  /** Adds (no id) or edits (with id). The first address becomes the default. */
  save(input: AddressInput): Promise<Address>;
  remove(id: string): Promise<void>;
}

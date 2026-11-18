/** Product ids the visitor has hearted, in the order they were added. */
export interface WishlistRepository {
  load(): Promise<string[]>;
  save(ids: readonly string[]): Promise<void>;
}

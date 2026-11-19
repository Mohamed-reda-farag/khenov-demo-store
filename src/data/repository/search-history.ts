export interface SearchHistoryRepository {
  list(): Promise<string[]>;
  add(term: string): Promise<void>;
  remove(term: string): Promise<void>;
  clear(): Promise<void>;
}

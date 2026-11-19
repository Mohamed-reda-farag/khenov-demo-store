export const MAX_RECENT_SEARCHES = 6;

/** Puts a search at the front, dropping an earlier copy (any case) and keeping the list short. */
export function pushRecentSearch(list: readonly string[], term: string): string[] {
  const clean = term.trim().replace(/\s+/g, ' ');
  if (clean.length < 2) return [...list];
  const rest = list.filter((t) => t.toLowerCase() !== clean.toLowerCase());
  return [clean, ...rest].slice(0, MAX_RECENT_SEARCHES);
}

export const removeRecentSearch = (list: readonly string[], term: string): string[] =>
  list.filter((t) => t !== term);

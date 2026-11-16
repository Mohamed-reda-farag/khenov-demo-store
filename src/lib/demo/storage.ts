import { APP_PREFIX, NAMESPACE } from './config';

/**
 * Safe, namespaced storage wrapper. Every call is wrapped in try/catch, and an
 * in-memory fallback keeps the demo working when localStorage is unavailable
 * (private mode, blocked cookies, quota errors).
 */
export interface DemoStorage {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): boolean;
  remove(key: string): void;
  /** Removes every key inside this namespace. */
  clear(): void;
  keys(): string[];
}

type BackingStore = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

function resolveBackingStore(): BackingStore | null {
  try {
    if (typeof window === 'undefined') return null;
    const store = window.localStorage;
    const probe = `${NAMESPACE}:__probe__`;
    store.setItem(probe, '1');
    store.removeItem(probe);
    return store;
  } catch {
    return null;
  }
}

export function createStorage(namespace: string, backing?: BackingStore | null): DemoStorage {
  const memory = new Map<string, string>();
  let store: BackingStore | null | undefined = backing;
  const prefix = `${namespace}:`;

  const resolve = (): BackingStore | null => {
    if (store === undefined) store = resolveBackingStore();
    return store;
  };

  return {
    get<T>(key: string, fallback: T): T {
      let raw: string | null = null;
      try {
        raw = resolve()?.getItem(prefix + key) ?? null;
      } catch {
        raw = null;
      }
      raw ??= memory.get(prefix + key) ?? null;
      try {
        return raw === null ? fallback : (JSON.parse(raw) as T);
      } catch {
        return fallback;
      }
    },
    set<T>(key: string, value: T): boolean {
      const raw = JSON.stringify(value);
      try {
        const target = resolve();
        if (target) {
          target.setItem(prefix + key, raw);
          return true;
        }
      } catch {
        // fall through to memory
      }
      memory.set(prefix + key, raw);
      return false;
    },
    remove(key: string) {
      memory.delete(prefix + key);
      try {
        resolve()?.removeItem(prefix + key);
      } catch {
        // nothing else to do
      }
    },
    clear() {
      for (const k of [...memory.keys()]) if (k.startsWith(prefix)) memory.delete(k);
      try {
        const target = resolve();
        if (!target) return;
        const doomed: string[] = [];
        for (let i = 0; i < target.length; i += 1) {
          const k = target.key(i);
          if (k?.startsWith(prefix)) doomed.push(k);
        }
        doomed.forEach((k) => target.removeItem(k));
      } catch {
        // nothing else to do
      }
    },
    keys() {
      const found = new Set<string>();
      for (const k of memory.keys()) if (k.startsWith(prefix)) found.add(k.slice(prefix.length));
      try {
        const target = resolve();
        if (target) {
          for (let i = 0; i < target.length; i += 1) {
            const k = target.key(i);
            if (k?.startsWith(prefix)) found.add(k.slice(prefix.length));
          }
        }
      } catch {
        // ignore
      }
      return [...found];
    },
  };
}

/** The app-wide storage instance, scoped to the current SEED_VERSION. */
export const storage: DemoStorage = createStorage(NAMESPACE);

/**
 * Removes data written by OTHER seed versions of this app. Called on boot so a
 * SEED_VERSION bump leaves no orphaned keys behind.
 */
export function purgeStaleVersions(backing?: BackingStore | null): number {
  try {
    const target = backing === undefined ? resolveBackingStore() : backing;
    if (!target) return 0;
    const doomed: string[] = [];
    for (let i = 0; i < target.length; i += 1) {
      const k = target.key(i);
      if (k?.startsWith(APP_PREFIX) && !k.startsWith(`${NAMESPACE}:`)) doomed.push(k);
    }
    doomed.forEach((k) => target.removeItem(k));
    return doomed.length;
  } catch {
    return 0;
  }
}

/**
 * Preferences (language, etc.) live OUTSIDE the versioned namespace on purpose:
 * resetting the demo or bumping the seed must not flip the visitor's language.
 */
const PREF_PREFIX = `${APP_PREFIX}pref:`;

export const prefsStorage = {
  get(key: string): string | null {
    try {
      return resolveBackingStore()?.getItem(PREF_PREFIX + key) ?? null;
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      resolveBackingStore()?.setItem(PREF_PREFIX + key, value);
    } catch {
      // preference is best-effort
    }
  },
};

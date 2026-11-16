'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: unknown; retry: () => void }
  | { status: 'success'; data: T; retry: () => void };

interface Settled<T> {
  key: string;
  attempt: number;
  result: { ok: true; data: T } | { ok: false; error: unknown };
}

/**
 * Runs `load` whenever `key` changes (or after `retry()`), exposing loading / error / success.
 * `key` must uniquely describe the request — it is the dependency, not the function.
 */
export function useAsync<T>(key: string, load: () => Promise<T>): AsyncState<T> {
  const loadRef = useRef(load);
  useLayoutEffect(() => {
    loadRef.current = load;
  });

  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadRef
      .current()
      .then((data) => {
        if (!cancelled) setSettled({ key, attempt, result: { ok: true, data } });
      })
      .catch((error: unknown) => {
        if (!cancelled) setSettled({ key, attempt, result: { ok: false, error } });
      });
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (!settled || settled.key !== key || settled.attempt !== attempt) return { status: 'loading' };
  return settled.result.ok
    ? { status: 'success', data: settled.result.data, retry }
    : { status: 'error', error: settled.result.error, retry };
}

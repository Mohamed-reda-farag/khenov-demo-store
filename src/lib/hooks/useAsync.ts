'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { getFlagsSnapshot, subscribeFlags } from '@/lib/demo/flags';

export type AsyncState<T> =
  /** `previous` is the last successful result (for keeping the old content visible while refining). */
  | { status: 'loading'; previous: T | undefined }
  | { status: 'error'; error: unknown; retry: () => void }
  | { status: 'success'; data: T; retry: () => void };

interface Settled<T> {
  key: string;
  attempt: number;
  result: { ok: true; data: T } | { ok: false; error: unknown };
}

/** True while ?demo=error is active. The server (and hydration) always see false. */
function useForcedError(): boolean {
  return useSyncExternalStore(
    subscribeFlags,
    () => getFlagsSnapshot().has('error'),
    () => false,
  );
}

/**
 * Runs `load` whenever `key` changes (or after `retry()`), exposing loading / error / success.
 * `key` must uniquely describe the request — it is the dependency, not the function.
 *
 * `initial` is data that was already known when the page was built (static export). It answers
 * the request for the FIRST key straight away, with no simulated network and no second render, so
 * the server HTML already holds the real content. Later keys (a filter, a retry) load normally,
 * and so does everything while ?demo=error is on, so error states stay reachable.
 */
export function useAsync<T>(key: string, load: () => Promise<T>, initial?: T): AsyncState<T> {
  const loadRef = useRef(load);
  useLayoutEffect(() => {
    loadRef.current = load;
  });

  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [previous, setPrevious] = useState<T | undefined>(undefined);
  const [firstKey] = useState(key);
  const forcedError = useForcedError();
  const useInitial = initial !== undefined && !forcedError && key === firstKey && attempt === 0;

  useEffect(() => {
    if (useInitial) return;
    let cancelled = false;
    loadRef
      .current()
      .then((data) => {
        if (cancelled) return;
        setSettled({ key, attempt, result: { ok: true, data } });
        setPrevious(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) setSettled({ key, attempt, result: { ok: false, error } });
      });
    return () => {
      cancelled = true;
    };
  }, [key, attempt, useInitial]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (useInitial) return { status: 'success', data: initial, retry };
  if (!settled || settled.key !== key || settled.attempt !== attempt)
    return { status: 'loading', previous: previous ?? initial };
  return settled.result.ok
    ? { status: 'success', data: settled.result.data, retry }
    : { status: 'error', error: settled.result.error, retry };
}

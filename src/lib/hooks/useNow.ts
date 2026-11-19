'use client';

import { useEffect, useState } from 'react';

/** The current time, refreshed every `intervalMs`, so time-based UI stays correct without reloads. */
export function useNow(intervalMs: number): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

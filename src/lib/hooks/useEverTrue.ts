'use client';

import { useState } from 'react';

/** True from the first render in which `value` was true onwards (it never goes back to false). */
export function useEverTrue(value: boolean): boolean {
  const [ever, setEver] = useState(value);
  if (value && !ever) setEver(true);
  return ever;
}

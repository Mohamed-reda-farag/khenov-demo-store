/**
 * Demo switches, set from the URL and remembered for the browser session:
 *   ?demo=fast   → no simulated network delay (for recording videos)
 *   ?demo=error  → every simulated request fails (to show error states)
 *   ?demo=off    → clears both
 * Several can be combined: ?demo=fast,error
 */
export type DemoFlag = 'fast' | 'error';

const SESSION_KEY = 'khenov-demo:atar:flags';

let flags: ReadonlySet<DemoFlag> = new Set();
let failNextRequest = false;
let initialised = false;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function parse(value: string | null): Set<DemoFlag> | 'clear' | null {
  if (!value) return null;
  const parts = value.split(',').map((p) => p.trim().toLowerCase());
  if (parts.includes('off')) return 'clear';
  const next = new Set<DemoFlag>();
  if (parts.includes('fast')) next.add('fast');
  if (parts.includes('error')) next.add('error');
  return next.size > 0 ? next : null;
}

/** Reads ?demo= from the URL (and the remembered session value). Safe to call repeatedly. */
export function initDemoFlags(): void {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;
  try {
    const fromUrl = parse(new URLSearchParams(window.location.search).get('demo'));
    if (fromUrl === 'clear') {
      window.sessionStorage.removeItem(SESSION_KEY);
      flags = new Set();
    } else if (fromUrl) {
      window.sessionStorage.setItem(SESSION_KEY, [...fromUrl].join(','));
      flags = fromUrl;
    } else {
      const remembered = parse(window.sessionStorage.getItem(SESSION_KEY));
      flags = remembered && remembered !== 'clear' ? remembered : new Set();
    }
  } catch {
    flags = new Set();
  }
  emit();
}

export function hasFlag(flag: DemoFlag): boolean {
  return flags.has(flag);
}

/** Makes only the next simulated request fail. Handy for demonstrating an error + retry. */
export function failNext(): void {
  failNextRequest = true;
}

export function consumeFailNext(): boolean {
  const value = failNextRequest;
  failNextRequest = false;
  return value;
}

export function subscribeFlags(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFlagsSnapshot(): ReadonlySet<DemoFlag> {
  return flags;
}

/** Test helper. */
export function setFlagsForTest(next: DemoFlag[]): void {
  flags = new Set(next);
  failNextRequest = false;
  initialised = true;
}

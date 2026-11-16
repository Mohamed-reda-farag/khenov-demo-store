import { consumeFailNext, hasFlag } from './flags';

/** Simulates network latency. Instant when ?demo=fast is active. */
export function delay(min = 200, max = 600): Promise<void> {
  if (hasFlag('fast')) return Promise.resolve();
  const ms = Math.round(min + Math.random() * Math.max(0, max - min));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class DemoNetworkError extends Error {
  constructor() {
    super('Simulated network failure');
    this.name = 'DemoNetworkError';
  }
}

/**
 * What repositories call before answering: latency, then an optional simulated failure
 * (?demo=error, or a one-shot failNext()).
 */
export async function simulateNetwork(min = 200, max = 600): Promise<void> {
  await delay(min, max);
  if (consumeFailNext() || hasFlag('error')) throw new DemoNetworkError();
}

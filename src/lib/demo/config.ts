/** Demo-kit configuration. Bump SEED_VERSION to reseed every visitor automatically. */
export const APP_ID = 'atar';
export const SEED_VERSION = 3;

export const NAMESPACE_ROOT = 'khenov-demo';

/** Full storage namespace for the current seed version: `khenov-demo:atar:v1`. */
export const NAMESPACE = `${NAMESPACE_ROOT}:${APP_ID}:v${SEED_VERSION}`;

/** Prefix shared by every version of this app (used to purge stale seed versions). */
export const APP_PREFIX = `${NAMESPACE_ROOT}:${APP_ID}:`;

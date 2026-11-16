import { SEED_VERSION } from './config';
import { purgeStaleVersions, storage } from './storage';

/**
 * Repositories that own persisted data register a seeder here. Seeders run on
 * first boot, after a SEED_VERSION bump, and after resetDemo().
 */
type Seeder = () => void;

const seeders: Seeder[] = [];
const resetListeners = new Set<() => void>();

export function registerSeeder(seeder: Seeder): void {
  seeders.push(seeder);
}

/** Subscribe to "the demo was reset" (stores use this to reload their state). */
export function onDemoReset(listener: () => void): () => void {
  resetListeners.add(listener);
  return () => resetListeners.delete(listener);
}

interface SeedMeta {
  seedVersion: number;
  seededAt: string;
}

function runSeeders(): void {
  seeders.forEach((seed) => seed());
  storage.set<SeedMeta>('meta', { seedVersion: SEED_VERSION, seededAt: new Date().toISOString() });
}

/** Seeds when this namespace has never been seeded; also drops other seed versions. */
export function ensureSeeded(): void {
  purgeStaleVersions();
  const meta = storage.get<SeedMeta | null>('meta', null);
  if (meta?.seedVersion !== SEED_VERSION) runSeeders();
}

/** Clears the namespace, reseeds, and tells subscribers. Called by the confirm dialog. */
export function resetDemo(): void {
  storage.clear();
  runSeeders();
  resetListeners.forEach((listener) => listener());
}

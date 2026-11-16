import '@/data/repository'; // registers every repository's seeder before seeding runs
import { ensureSeeded, initDemoFlags } from '@/lib/demo';

/**
 * Runs once when the client bundle first evaluates — i.e. BEFORE any component effect —
 * so ?demo=fast is honoured by the very first request and seeding precedes the first read.
 */
if (typeof window !== 'undefined') {
  initDemoFlags();
  ensureSeeded();
}

export interface RatingBucket {
  star: 1 | 2 | 3 | 4 | 5;
  count: number;
}

const STARS = [5, 4, 3, 2, 1] as const;

function meanFor(lambda: number): number {
  let total = 0;
  let weighted = 0;
  for (const star of STARS) {
    const weight = Math.exp(lambda * star);
    total += weight;
    weighted += weight * star;
  }
  return weighted / total;
}

/**
 * Splits `count` reviews across 5..1 stars so their mean matches `average`.
 * An exponential tilt gives a natural-looking shape (mostly 5 and 4 for a high average);
 * largest-remainder rounding keeps the total exact.
 */
export function ratingDistribution(average: number, count: number): RatingBucket[] {
  const target = Math.min(4.95, Math.max(1.05, average));
  let low = -8;
  let high = 8;
  for (let i = 0; i < 60; i += 1) {
    const mid = (low + high) / 2;
    if (meanFor(mid) < target) low = mid;
    else high = mid;
  }
  const lambda = (low + high) / 2;
  const weights = STARS.map((star) => Math.exp(lambda * star));
  const sum = weights.reduce((a, b) => a + b, 0);
  const exact = weights.map((w) => (w / sum) * count);
  const floors = exact.map(Math.floor);
  let remaining = count - floors.reduce((a, b) => a + b, 0);
  const order = exact
    .map((value, i) => ({ i, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (const { i } of order) {
    if (remaining <= 0) break;
    floors[i] = (floors[i] ?? 0) + 1;
    remaining -= 1;
  }
  return STARS.map((star, i) => ({ star, count: floors[i] ?? 0 }));
}

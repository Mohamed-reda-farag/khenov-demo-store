import { Star } from 'lucide-react';

/** Decorative star row. Always pair it with the rating as text (or an aria-label on a parent). */
export function Stars({ value, className = 'size-4' }: { value: number; className?: string }) {
  const percent = Math.min(100, Math.max(0, (value / 5) * 100));
  const row = (filled: boolean) => (
    <span className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          aria-hidden
          className={`${className} shrink-0 ${filled ? 'fill-accent-500 text-accent-500' : 'text-sand-300'}`}
        />
      ))}
    </span>
  );
  return (
    <span aria-hidden className="relative inline-flex">
      {row(false)}
      <span className="absolute inset-y-0 start-0 overflow-hidden" style={{ width: `${percent}%` }}>
        {row(true)}
      </span>
    </span>
  );
}

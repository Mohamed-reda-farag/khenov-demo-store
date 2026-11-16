interface SkeletonProps {
  className?: string;
}

/** Loading placeholder. Decorative: screen readers get the surrounding live region instead. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div aria-hidden className={`skeleton rounded-sm ${className}`} />;
}

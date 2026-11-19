import type { InputHTMLAttributes, ReactNode } from 'react';

interface RadioCardProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children' | 'title'
> {
  title: ReactNode;
  /** Right-aligned detail, e.g. a price. */
  aside?: ReactNode;
  children?: ReactNode;
}

/** A radio choice drawn as a card. The native input stays in the page, so keyboard and screen readers work. */
export function RadioCard({ title, aside, children, className = '', ...rest }: RadioCardProps) {
  return (
    <label
      className={`relative flex min-h-14 cursor-pointer gap-3 rounded-md border border-sand-300 bg-paper p-4 has-[:checked]:border-ink-900 has-[:checked]:ring-1 has-[:checked]:ring-ink-900 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink-900 ${className}`}
    >
      <input type="radio" className="mt-1 size-4 shrink-0 accent-ink-900" {...rest} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-medium">{title}</span>
          {aside ? <span className="shrink-0 text-sm font-semibold">{aside}</span> : null}
        </span>
        {children ? <span className="text-sm text-ink-500">{children}</span> : null}
      </span>
    </label>
  );
}

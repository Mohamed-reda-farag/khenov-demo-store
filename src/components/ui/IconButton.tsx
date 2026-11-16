import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** Required: icon-only controls need an accessible name. */
  label: string;
  children: ReactNode;
}

export const iconButtonClasses =
  'relative inline-grid size-11 shrink-0 place-items-center rounded-pill text-ink-900 hover:bg-sand-100 transition-transform dur-fast ease-brand active:scale-95 disabled:pointer-events-none disabled:opacity-50';

export function IconButton({
  label,
  children,
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`${iconButtonClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

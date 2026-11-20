import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

interface StyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const base =
  'relative inline-flex select-none items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap transition-transform dur-fast ease-brand active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent-600 text-white hover:bg-accent-700',
  secondary: 'border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-paper',
  ghost: 'text-ink-900 hover:bg-sand-100',
  danger: 'bg-danger-600 text-white hover:bg-ink-900',
};

const sizes: Record<ButtonSize, string> = {
  md: 'min-h-12 px-6 text-sm',
  lg: 'min-h-14 px-8 text-base',
};

/** Shared by <Button> and link-styled buttons so both look identical. */
export function buttonClasses({ variant = 'primary', size = 'md', fullWidth }: StyleOptions = {}) {
  return `${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, StyleOptions {
  loading?: boolean;
  leadingIcon?: ReactNode;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  leadingIcon,
  disabled,
  className = '',
  children,
  type = 'button',
  onClick,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${buttonClasses({ variant, size, fullWidth })} ${className}`}
      disabled={disabled}
      // Busy, not disabled: a disabled button drops keyboard focus, which would strand the user
      // mid-form. Clicks and form submits are ignored by the guard below while loading.
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...rest}
    >
      {loading ? (
        <svg aria-hidden viewBox="0 0 24 24" className="size-4 animate-spin" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        leadingIcon
      )}
      {children}
    </button>
  );
}

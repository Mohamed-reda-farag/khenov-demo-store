import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { useId } from 'react';

interface FieldFrameProps {
  id: string;
  label: string;
  /** Helper text, replaced by the error when there is one. */
  hint?: string | undefined;
  error?: string | undefined;
  optionalLabel?: string | undefined;
  children: ReactNode;
}

const control =
  'min-h-12 w-full rounded-md border bg-paper px-4 text-base text-ink-900 placeholder:text-ink-400 disabled:opacity-50';
const border = (error: boolean) => (error ? 'border-danger-600' : 'border-sand-300');

/**
 * Label, control and one reserved line for the hint or error, so validating a form never moves
 * the fields below it.
 */
function FieldFrame({ id, label, hint, error, optionalLabel, children }: FieldFrameProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {optionalLabel ? (
          <span className="font-normal ms-1 text-ink-500">({optionalLabel})</span>
        ) : null}
      </label>
      {children}
      <p
        id={`${id}-note`}
        className={`min-h-5 text-sm ${error ? 'font-medium text-danger-600' : 'text-ink-500'}`}
      >
        {error ?? hint}
      </p>
    </div>
  );
}

interface CommonProps {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  optionalLabel?: string | undefined;
}

export function TextField({
  label,
  hint,
  error,
  optionalLabel,
  id,
  className = '',
  ...rest
}: CommonProps & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <FieldFrame id={inputId} label={label} hint={hint} error={error} optionalLabel={optionalLabel}>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${inputId}-note`}
        className={`${control} ${border(Boolean(error))} ${className}`}
        {...rest}
      />
    </FieldFrame>
  );
}

export function SelectField({
  label,
  hint,
  error,
  optionalLabel,
  id,
  className = '',
  children,
  ...rest
}: CommonProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const selectId = id ?? auto;
  return (
    <FieldFrame id={selectId} label={label} hint={hint} error={error} optionalLabel={optionalLabel}>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${selectId}-note`}
        className={`${control} ${border(Boolean(error))} ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FieldFrame>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  optionalLabel,
  id,
  className = '',
  ...rest
}: CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const areaId = id ?? auto;
  return (
    <FieldFrame id={areaId} label={label} hint={hint} error={error} optionalLabel={optionalLabel}>
      <textarea
        id={areaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${areaId}-note`}
        className={`${control} ${border(Boolean(error))} min-h-24 py-3 ${className}`}
        {...rest}
      />
    </FieldFrame>
  );
}

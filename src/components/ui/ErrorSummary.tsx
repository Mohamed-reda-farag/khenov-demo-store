'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';

export interface ErrorSummaryItem {
  /** Id of the field the message belongs to. */
  fieldId: string;
  /** Name of the field, so the list reads "Email: Enter a valid email" out of context. */
  label: string;
  message: string;
}

interface ErrorSummaryProps {
  title: string;
  items: readonly ErrorSummaryItem[];
  /** Changes every time a failed submit should pull focus to the summary. */
  focusSignal: number;
}

/** Lists what is wrong after a failed submit and takes focus, each item jumping to its field. */
export function ErrorSummary({ title, items, focusSignal }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusSignal > 0) ref.current?.focus();
  }, [focusSignal]);

  if (items.length === 0) return null;
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="rounded-md border border-danger-600 bg-danger-100 p-4 text-sm outline-none"
    >
      <p className="flex items-center gap-2 font-semibold text-danger-600">
        <AlertTriangle aria-hidden className="size-5" />
        {title}
      </p>
      <ul className="mt-2 list-disc ps-5">
        {items.map((item) => (
          <li key={item.fieldId}>
            <a
              href={`#${item.fieldId}`}
              className="inline-flex min-h-11 items-center underline underline-offset-4"
              onClick={(event) => {
                event.preventDefault();
                const target = document.getElementById(item.fieldId);
                target?.focus();
                target?.scrollIntoView({ block: 'center' });
              }}
            >
              {item.label}: {item.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

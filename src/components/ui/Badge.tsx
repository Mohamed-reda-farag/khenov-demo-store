import type { ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'dark' | 'warning' | 'success';

const tones: Record<Tone, string> = {
  neutral: 'bg-sand-100 text-ink-700',
  accent: 'bg-accent-600 text-white',
  dark: 'bg-ink-900 text-paper',
  warning: 'bg-warning-100 text-warning-700',
  success: 'bg-success-100 text-success-600',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

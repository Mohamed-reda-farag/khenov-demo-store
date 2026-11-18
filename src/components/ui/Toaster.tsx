'use client';

import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useToastStore, type ToastItem, type ToastTone } from './toast';

const icons: Record<ToastTone, typeof Info> = { info: Info, success: CheckCircle2, error: XCircle };
const iconTone: Record<ToastTone, string> = {
  info: 'text-sand-200',
  success: 'text-success-100',
  error: 'text-danger-100',
};

function ToastCard({ item }: { item: ToastItem }) {
  const t = useTranslations('common');
  const dismiss = useToastStore((s) => s.dismiss);
  const [paused, setPaused] = useState(false);
  const Icon = icons[item.tone];

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => dismiss(item.id), item.durationMs);
    return () => clearTimeout(timer);
  }, [paused, dismiss, item.id, item.durationMs]);

  return (
    <div
      className="toast-item pointer-events-auto flex min-h-12 max-w-[min(32rem,calc(100vw-2rem))] items-center gap-3 rounded-pill bg-ink-900 ps-4 pe-2 text-sm text-paper shadow-lift"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon aria-hidden className={`size-5 shrink-0 ${iconTone[item.tone]}`} />
      <span className="py-2">{item.message}</span>
      {item.action ? (
        <button
          type="button"
          className="min-h-11 rounded-full px-4 font-semibold text-accent-100 hover:bg-ink-700"
          onClick={() => {
            item.action?.onAction();
            dismiss(item.id);
          }}
        >
          {item.action.label}
        </button>
      ) : null}
      <button
        type="button"
        aria-label={t('close')}
        className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-ink-700"
        onClick={() => dismiss(item.id)}
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}

/** Rendered OUTSIDE the inert app shell so action buttons (Undo) stay clickable above overlays. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--toast-offset,0px)+1rem)] z-toast flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}

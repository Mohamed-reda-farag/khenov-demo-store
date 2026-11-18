'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { IconButton } from './IconButton';
import { Portal } from './Portal';
import { useOverlayBehavior } from './overlay';

type ModalSize = 'md' | 'lg' | 'xl';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: ModalSize;
  children: ReactNode;
  /** Pinned below the scrolling content (e.g. the "Apply" button of the filter sheet). */
  footer?: ReactNode;
  /** Hide the visible title but keep it for screen readers. */
  hideTitle?: boolean;
}

const widths: Record<ModalSize, string> = {
  md: 'md:max-w-lg',
  lg: 'md:max-w-3xl',
  xl: 'md:max-w-5xl',
};

/** Matches --dur-base so the exit animation finishes before the content unmounts. */
const EXIT_MS = 240;

/**
 * A bottom sheet on phones and a centred dialog from `md` up. The content is mounted only while
 * the modal is open (or finishing its exit), so a page can hold many of them cheaply.
 */
export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  hideTitle = false,
}: ModalProps) {
  const t = useTranslations('common');
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [lingering, setLingering] = useState(open);
  const [shown, setShown] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Keep the content mounted through the exit animation (adjusted during render, not in an effect).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setLingering(true);
    else setShown(false);
  }

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(frame);
    }
    const timer = setTimeout(() => setLingering(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useOverlayBehavior(open, panelRef, onClose);

  if (!open && !lingering) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-overlay" inert={!open}>
        <div
          className="overlay-scrim absolute inset-0 bg-ink-900/50"
          data-open={shown}
          onClick={onClose}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center md:items-center md:p-6">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            data-open={shown}
            className={`modal-panel pointer-events-auto flex max-h-[92dvh] w-full flex-col rounded-t-lg bg-paper shadow-overlay outline-none md:max-h-[88dvh] md:rounded-lg ${widths[size]}`}
          >
            <header
              className={`flex items-center justify-between gap-4 px-5 py-3 ${
                hideTitle ? '' : 'border-b border-sand-200'
              }`}
            >
              <h2
                id={titleId}
                className={hideTitle ? 'sr-only' : 'font-display text-xl font-semibold'}
              >
                {title}
              </h2>
              <IconButton label={t('close')} onClick={onClose} className="ms-auto -me-2">
                <X aria-hidden className="size-5" />
              </IconButton>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
            {footer ? (
              <footer className="border-t border-sand-200 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {footer}
              </footer>
            ) : null}
          </div>
        </div>
      </div>
    </Portal>
  );
}

'use client';

import { useId, useRef } from 'react';
import { Button } from './Button';
import { Portal } from './Portal';
import { useOverlayBehavior } from './overlay';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  tone?: 'default' | 'danger';
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'default',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior(open, panelRef, onCancel);

  return (
    <Portal>
      <div
        className={`fixed inset-0 z-overlay grid place-items-center p-4 ${open ? '' : 'pointer-events-none'}`}
        inert={!open}
        aria-hidden={!open}
      >
        <div
          className="overlay-scrim absolute inset-0 bg-ink-900/50"
          data-open={open}
          onClick={onCancel}
          aria-hidden
        />
        <div
          ref={panelRef}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          tabIndex={-1}
          data-open={open}
          className="dialog-panel relative w-full max-w-md rounded-lg bg-paper p-6 shadow-overlay outline-none"
        >
          <h2 id={titleId} className="font-display text-xl font-semibold">
            {title}
          </h2>
          <p id={descId} className="mt-2 text-sm text-ink-700">
            {description}
          </p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onCancel} disabled={pending} data-autofocus>
              {cancelLabel}
            </Button>
            <Button
              variant={tone === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
              loading={pending}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

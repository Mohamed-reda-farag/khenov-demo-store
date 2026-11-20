'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useRef, type ReactNode } from 'react';
import { IconButton } from './IconButton';
import { useEntered, useOverlayBehavior } from './overlay';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** 'end' = right in LTR, left in RTL (cart). 'start' = the opposite (mobile nav). */
  side?: 'start' | 'end';
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer({ open, onClose, title, side = 'end', children, footer }: DrawerProps) {
  const t = useTranslations('common');
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const entered = useEntered();
  useOverlayBehavior(open, panelRef, onClose);

  return (
    <div
      className={`fixed inset-0 z-overlay ${open ? '' : 'pointer-events-none'}`}
      inert={!open}
      aria-hidden={!open}
    >
      <div
        className="overlay-scrim absolute inset-0 bg-ink-900/50"
        data-open={open && entered}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-open={open && entered}
        data-side={side}
        className={`drawer-panel absolute inset-y-0 flex w-full max-w-[26rem] flex-col bg-paper outline-none ${
          side === 'end' ? 'end-0' : 'start-0'
        }`}
      >
        <header className="flex items-center justify-between gap-4 border-b border-sand-200 px-6 py-4">
          <h2 id={titleId} className="font-display text-xl font-semibold">
            {title}
          </h2>
          <IconButton label={t('close')} onClick={onClose}>
            <X aria-hidden className="size-5" />
          </IconButton>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer ? <footer className="border-t border-sand-200 px-6 py-4">{footer}</footer> : null}
      </div>
    </div>
  );
}

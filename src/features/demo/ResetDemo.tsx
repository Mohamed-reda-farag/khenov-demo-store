'use client';

import { RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/toast';
import { resetDemo } from '@/lib/demo';
import { useDemoUiStore } from './demo-ui.store';

/** Footer / settings trigger. Opens the confirm dialog mounted once in the shell. */
export function ResetDemoButton({ className = '' }: { className?: string }) {
  const t = useTranslations('demo');
  const openReset = useDemoUiStore((s) => s.openReset);
  return (
    <button
      type="button"
      onClick={openReset}
      className={`inline-flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:underline ${className}`}
    >
      <RotateCcw aria-hidden className="size-4" />
      {t('reset')}
    </button>
  );
}

export function ResetDemoDialog() {
  const t = useTranslations('demo');
  const open = useDemoUiStore((s) => s.resetOpen);
  const close = useDemoUiStore((s) => s.closeReset);

  const confirm = () => {
    resetDemo();
    close();
    toast.success(t('resetDone'));
  };

  return (
    <ConfirmDialog
      open={open}
      tone="danger"
      title={t('resetTitle')}
      description={t('resetBody')}
      confirmLabel={t('resetConfirm')}
      cancelLabel={t('resetCancel')}
      onConfirm={confirm}
      onCancel={close}
    />
  );
}

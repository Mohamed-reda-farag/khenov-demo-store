'use client';

import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { SizeGuideContent } from './SizeGuideContent';

export function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations('product');

  return (
    <Modal open={open} onClose={onClose} title={t('sizeGuideTitle')} size="md">
      <div className="px-5 py-5">
        <SizeGuideContent />
      </div>
    </Modal>
  );
}

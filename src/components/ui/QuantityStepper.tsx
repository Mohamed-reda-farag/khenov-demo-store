'use client';

import { Minus, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormat } from '@/lib/hooks/useFormat';
import { IconButton } from './IconButton';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, min = 1, max, onChange }: QuantityStepperProps) {
  const t = useTranslations('cart');
  const format = useFormat();
  return (
    <div
      role="group"
      aria-label={t('quantity')}
      className="inline-flex items-center rounded-pill border border-sand-300"
    >
      <IconButton
        label={t('decrease')}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus aria-hidden className="size-4" />
      </IconButton>
      <span aria-live="polite" className="min-w-8 text-center text-sm font-medium">
        {format.number(value)}
      </span>
      <IconButton
        label={t('increase')}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus aria-hidden className="size-4" />
      </IconButton>
    </div>
  );
}

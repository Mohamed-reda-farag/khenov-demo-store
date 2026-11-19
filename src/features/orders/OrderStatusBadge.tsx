'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import type { OrderStatus } from '@/data/types';

const TONES = {
  placed: 'neutral',
  processing: 'warning',
  shipped: 'accent',
  delivered: 'success',
  cancelled: 'danger',
} as const;

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations('orders.status');
  return <Badge tone={TONES[status]}>{t(status)}</Badge>;
}

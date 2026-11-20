'use client';

import { useTranslations } from 'next-intl';
import { Accordion } from '@/components/ui/Accordion';

const QUESTIONS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6'] as const;
const ANSWERS = { q1: 'a1', q2: 'a2', q3: 'a3', q4: 'a4', q5: 'a5', q6: 'a6' } as const;

export function Faq() {
  const t = useTranslations('help.contact');
  return (
    <Accordion
      items={QUESTIONS.map((q) => ({
        id: q,
        title: t(q),
        content: <p>{t(ANSWERS[q])}</p>,
      }))}
    />
  );
}

'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorSummary, type ErrorSummaryItem } from '@/components/ui/ErrorSummary';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { simulateNetwork } from '@/lib/demo';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type FieldName = 'name' | 'email' | 'message';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOPICS = ['topicOrder', 'topicSize', 'topicOther'] as const;

/**
 * UI-only contact form. It validates like a real one and takes a moment to "send", but nothing
 * leaves the page or is stored, and the confirmation says so.
 */
export function ContactForm() {
  const t = useTranslations('help.contact');
  const states = useTranslations('states');
  const base = useId();
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>('topicOrder');
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [focusSignal, setFocusSignal] = useState(0);
  const confirmation = useRef<HTMLDivElement>(null);
  const ids: Record<FieldName, string> = {
    name: `${base}-name`,
    email: `${base}-email`,
    message: `${base}-message`,
  };

  useEffect(() => {
    if (status === 'sent') confirmation.current?.focus();
  }, [status]);

  const validate = () => {
    const found: Partial<Record<FieldName, string>> = {};
    if (!values.name.trim()) found.name = t('required');
    if (!values.email.trim()) found.email = t('required');
    else if (!EMAIL.test(values.email.trim())) found.email = t('invalidEmail');
    if (!values.message.trim()) found.message = t('required');
    return found;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFocusSignal((n) => n + 1);
      return;
    }
    setStatus('sending');
    try {
      await simulateNetwork(500, 900);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div
        ref={confirmation}
        role="status"
        tabIndex={-1}
        className="flex items-start gap-3 rounded-md bg-success-100 p-5 outline-none"
      >
        <CheckCircle2 aria-hidden className="text-success-700 mt-0.5 size-6 shrink-0" />
        <div>
          <p className="font-display text-lg font-semibold">{t('successTitle')}</p>
          <p className="mt-1 text-sm text-ink-700">{t('successBody')}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => {
              setValues({ name: '', email: '', message: '' });
              setStatus('idle');
            }}
          >
            {t('again')}
          </Button>
        </div>
      </div>
    );
  }

  const summary: ErrorSummaryItem[] = (['name', 'email', 'message'] as const).flatMap((field) =>
    errors[field] ? [{ fieldId: ids[field], label: t(field), message: errors[field] }] : [],
  );

  return (
    <form onSubmit={submit} noValidate className="flex max-w-xl flex-col gap-2">
      <p className="rounded-md bg-sand-100 p-3 text-sm text-ink-700">{t('demoNotice')}</p>
      <ErrorSummary title={t('errorSummary')} items={summary} focusSignal={focusSignal} />
      <TextField
        id={ids.name}
        label={t('name')}
        autoComplete="name"
        value={values.name}
        error={errors.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
      />
      <TextField
        id={ids.email}
        label={t('email')}
        type="email"
        dir="ltr"
        inputMode="email"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
      />
      <SelectField
        label={t('topic')}
        value={topic}
        onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
      >
        {TOPICS.map((key) => (
          <option key={key} value={key}>
            {t(key)}
          </option>
        ))}
      </SelectField>
      <TextAreaField
        id={ids.message}
        label={t('message')}
        rows={5}
        value={values.message}
        error={errors.message}
        onChange={(e) => setValues({ ...values, message: e.target.value })}
      />
      {status === 'error' ? (
        <p role="alert" className="text-sm font-medium text-danger-600">
          {states('errorBody')}
        </p>
      ) : null}
      <Button type="submit" loading={status === 'sending'} className="w-fit">
        {t('submit')}
      </Button>
    </form>
  );
}

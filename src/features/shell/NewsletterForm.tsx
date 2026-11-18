'use client';

import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { newsletterRepository } from '@/data/repository';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** UI-only sign-up: nothing is sent anywhere, and the success message says so. */
export function NewsletterForm() {
  const t = useTranslations('newsletter');
  const id = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [invalid, setInvalid] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setStatus('submitting');
    try {
      await newsletterRepository.subscribe(email);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div role="status" className="flex items-start gap-3 rounded-md bg-ink-700 p-5">
        <CheckCircle2 aria-hidden className="mt-0.5 size-6 shrink-0 text-success-100" />
        <div>
          <p className="font-display text-lg font-semibold">{t('successTitle')}</p>
          <p className="mt-1 text-sm text-sand-200">{t('successBody')}</p>
        </div>
      </div>
    );
  }

  const describedBy = invalid ? `${id}-invalid` : status === 'error' ? `${id}-error` : undefined;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <label htmlFor={id} className="text-sm text-sand-200">
        {t('label')}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id={id}
          type="email"
          dir="ltr"
          inputMode="email"
          autoComplete="email"
          value={email}
          placeholder={t('placeholder')}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(event) => setEmail(event.target.value)}
          className="h-12 w-full min-w-0 rounded-pill border border-ink-500 bg-ink-900 px-5 text-base text-paper placeholder:[text-align:start] placeholder:text-ink-400 sm:flex-1"
        />
        <Button type="submit" loading={status === 'submitting'}>
          {t('submit')}
        </Button>
      </div>
      {invalid ? (
        <p id={`${id}-invalid`} role="alert" className="text-sm text-danger-100">
          {t('invalid')}
        </p>
      ) : null}
      {status === 'error' ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-danger-100">
          {t('error')}
        </p>
      ) : null}
      <p className="text-xs text-sand-300">{t('demoNote')}</p>
    </form>
  );
}

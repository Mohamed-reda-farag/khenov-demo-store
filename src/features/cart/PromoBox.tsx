'use client';

import { CheckCircle2, TicketPercent } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  evaluatePromo,
  HINT_CODES,
  normalizePromoCode,
  PROMO_CODES,
  type PromoCode,
  type PromoResult,
} from '@/data/rules/promo';
import { useFormat } from '@/lib/hooks/useFormat';
import { useNow } from '@/lib/hooks/useNow';
import { useCartStore } from './cart.store';

type Failure = Extract<PromoResult, { ok: false }>;

/** Turns a failed evaluation into a sentence. Shared by the typed-code error and the stale-code notice. */
function useFailureMessage() {
  const t = useTranslations('promo');
  const format = useFormat();
  return (failure: Failure, subtotal: number): string => {
    switch (failure.reason) {
      case 'empty':
        return t('errorEmpty');
      case 'unknown':
        return t('errorUnknown');
      case 'expired':
        return t('errorExpired', {
          date: failure.promo?.expiresOn ? format.date(failure.promo.expiresOn) : '',
        });
      case 'min-subtotal':
        return t('errorMinSubtotal', {
          amount: format.price(Math.max(0, (failure.promo?.minSubtotal ?? 0) - subtotal)),
        });
    }
  };
}

/** Promo code field with the demo codes as one-tap hints, and the applied / no-longer-valid states. */
export function PromoBox({ subtotal, result }: { subtotal: number; result: PromoResult | null }) {
  const t = useTranslations('promo');
  const format = useFormat();
  const inputId = useId();
  const messageId = useId();
  const promoCode = useCartStore((s) => s.promoCode);
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  const now = useNow(60_000);
  const failureMessage = useFailureMessage();
  const [text, setText] = useState('');
  const [attempt, setAttempt] = useState<Failure | null>(null);

  const apply = (value: string) => {
    const outcome = evaluatePromo(value, subtotal, now);
    if (outcome.ok) {
      setPromoCode(outcome.promo.code);
      setText('');
      setAttempt(null);
    } else {
      setAttempt(outcome);
    }
  };

  const remove = () => {
    setPromoCode(null);
    setAttempt(null);
  };

  const describe = (promo: PromoCode) => format.text(promo.description);

  if (promoCode && result) {
    return (
      <div className="flex flex-col gap-2">
        <div
          role="status"
          className={`flex items-start gap-3 rounded-md p-4 text-sm ${
            result.ok ? 'bg-success-100' : 'bg-warning-100'
          }`}
        >
          {result.ok ? (
            <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-success-600" />
          ) : (
            <TicketPercent aria-hidden className="mt-0.5 size-5 shrink-0 text-warning-700" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              <bdi dir="ltr">{promoCode}</bdi>
            </p>
            <p className="text-ink-700">
              {result.ok ? describe(result.promo) : failureMessage(result, subtotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={remove}
            className="inline-flex min-h-11 shrink-0 items-center px-2 font-semibold underline underline-offset-4"
          >
            {t('remove')}
          </button>
        </div>
      </div>
    );
  }

  const hints = HINT_CODES.map((code) => PROMO_CODES.find((p) => p.code === code)).filter(
    (p): p is PromoCode => p !== undefined,
  );

  return (
    <div className="flex flex-col gap-3">
      <form
        className="flex flex-col gap-1.5"
        onSubmit={(event) => {
          event.preventDefault();
          apply(text);
        }}
      >
        <label htmlFor={inputId} className="text-sm font-medium">
          {t('label')}
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setAttempt(null);
            }}
            dir="ltr"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            placeholder={t('placeholder')}
            aria-invalid={attempt ? true : undefined}
            aria-describedby={messageId}
            className={`min-h-12 min-w-0 flex-1 rounded-pill border bg-paper px-4 text-base uppercase placeholder:normal-case ${
              attempt ? 'border-danger-600' : 'border-sand-300'
            }`}
          />
          <Button type="submit" variant="secondary">
            {t('apply')}
          </Button>
        </div>
        <p
          id={messageId}
          aria-live="polite"
          className="min-h-5 text-sm font-medium text-danger-600"
        >
          {attempt ? failureMessage(attempt, subtotal) : null}
        </p>
      </form>
      <div>
        <p className="text-xs text-ink-500">{t('hintsTitle')}</p>
        <ul className="mt-1 flex flex-wrap gap-2">
          {hints.map((promo) => (
            <li key={promo.code}>
              <button
                type="button"
                onClick={() => apply(promo.code)}
                aria-label={`${normalizePromoCode(promo.code)}: ${describe(promo)}`}
                className="inline-flex min-h-11 items-center rounded-pill border border-dashed border-sand-300 px-4 text-sm font-medium hover:bg-sand-100"
              >
                <bdi dir="ltr">{promo.code}</bdi>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

'use client';

import { CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { TextField } from '@/components/ui/Field';
import {
  cvcLength,
  detectBrand,
  formatCardNumber,
  formatCvc,
  formatExpiry,
  TEST_CARD_APPROVED,
  TEST_CARD_DECLINED,
  type CardField,
  type CardInput,
} from '@/data/rules/card';
import { useErrorText } from './useErrorText';

interface CardFieldsProps {
  card: CardInput;
  errors: Partial<Record<CardField, string>>;
  onChange: (card: CardInput) => void;
  disabled?: boolean;
}

const BRAND_LABEL = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  meeza: 'Meeza',
} as const;

/**
 * Mock card form. The values live only in the parent's React state and are cleared when the
 * order is placed: nothing here writes them anywhere.
 */
export function CardFields({ card, errors, onChange, disabled = false }: CardFieldsProps) {
  const t = useTranslations('checkout');
  const text = useErrorText();
  const brand = detectBrand(card.number);

  return (
    <div className="flex flex-col gap-1">
      <div className="grid gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="relative">
            <TextField
              id="checkout-card-number"
              label={t('cardNumber')}
              inputMode="numeric"
              autoComplete="cc-number"
              dir="ltr"
              placeholder="0000 0000 0000 0000"
              disabled={disabled}
              value={card.number}
              error={text(errors.number)}
              className="pr-24 text-start"
              onChange={(e) => onChange({ ...card, number: formatCardNumber(e.target.value) })}
            />
            <span
              aria-live="polite"
              className="pointer-events-none absolute top-[2.25rem] right-3 inline-flex h-7 items-center gap-1 rounded-sm bg-sand-100 px-2 text-xs font-semibold text-ink-700"
            >
              <CreditCard aria-hidden className="size-3.5" />
              {brand === 'unknown' ? t('cardBrandUnknown') : BRAND_LABEL[brand]}
            </span>
          </div>
        </div>
        <TextField
          id="checkout-card-expiry"
          label={t('cardExpiry')}
          inputMode="numeric"
          autoComplete="cc-exp"
          dir="ltr"
          placeholder="MM/YY"
          disabled={disabled}
          value={card.expiry}
          error={text(errors.expiry)}
          className="text-start"
          onChange={(e) => onChange({ ...card, expiry: formatExpiry(e.target.value) })}
        />
        <TextField
          id="checkout-card-cvc"
          label={t('cardCvc')}
          hint={t('cardCvcHint', { digits: cvcLength(brand) })}
          inputMode="numeric"
          autoComplete="cc-csc"
          dir="ltr"
          placeholder={brand === 'amex' ? '0000' : '000'}
          disabled={disabled}
          value={card.cvc}
          error={text(errors.cvc)}
          className="text-start"
          onChange={(e) => onChange({ ...card, cvc: formatCvc(e.target.value, brand) })}
        />
      </div>
      <div className="rounded-md bg-sand-100 p-4 text-sm text-ink-700">
        <p className="font-medium">{t('testCardsTitle')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ number: TEST_CARD_APPROVED, expiry: '12/30', cvc: '123' })}
            className="hover:bg-sand-50 inline-flex min-h-11 items-center rounded-pill border border-sand-300 bg-paper px-4 font-medium disabled:opacity-50"
          >
            {t('fillApproved')} · <bdi dir="ltr">{TEST_CARD_APPROVED}</bdi>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange({ number: TEST_CARD_DECLINED, expiry: '12/30', cvc: '123' })}
            className="hover:bg-sand-50 inline-flex min-h-11 items-center rounded-pill border border-sand-300 bg-paper px-4 font-medium disabled:opacity-50"
          >
            {t('fillDeclined')} · <bdi dir="ltr">{TEST_CARD_DECLINED}</bdi>
          </button>
        </div>
      </div>
    </div>
  );
}

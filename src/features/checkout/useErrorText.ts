'use client';

import { useTranslations } from 'next-intl';

type ErrorCode =
  | 'required'
  | 'email'
  | 'phone'
  | 'tooShort'
  | 'tooLong'
  | 'cardNumber'
  | 'cardExpiry'
  | 'cardExpired'
  | 'cardCvc';

const CODES: readonly string[] = [
  'required',
  'email',
  'phone',
  'tooShort',
  'tooLong',
  'cardNumber',
  'cardExpiry',
  'cardExpired',
  'cardCvc',
];

const isCode = (value: string): value is ErrorCode => CODES.includes(value);

/** Maps a validation code from the pure rules to a sentence in the current language. */
export function useErrorText(): (code: string | undefined) => string | undefined {
  const t = useTranslations('errors');
  return (code) => (code && isCode(code) ? t(code) : undefined);
}

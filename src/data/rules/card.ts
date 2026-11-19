/**
 * Mock card rules. Card numbers exist only in the checkout form's React state: nothing here
 * (or anywhere) writes them to storage, a repository, or the console.
 */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'meeza' | 'unknown';

export const TEST_CARD_APPROVED = '4242 4242 4242 4242';
export const TEST_CARD_DECLINED = '4000 0000 0000 0002';

export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

export function detectBrand(number: string): CardBrand {
  const d = digitsOnly(number);
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|2(2[2-9][1-9]|2[3-9]|[3-6]|7[01]|720))/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^5078/.test(d)) return 'meeza';
  return 'unknown';
}

const maxDigits = (brand: CardBrand): number => (brand === 'amex' ? 15 : 16);

/** Groups digits as the card does (4-4-4-4, or 4-6-5 for Amex) and caps the length. */
export function formatCardNumber(input: string): string {
  const brand = detectBrand(input);
  const d = digitsOnly(input).slice(0, maxDigits(brand));
  const groups = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4];
  const parts: string[] = [];
  let at = 0;
  for (const size of groups) {
    if (at >= d.length) break;
    parts.push(d.slice(at, at + size));
    at += size;
  }
  return parts.join(' ');
}

/** Luhn checksum, the check real card numbers satisfy. */
export function luhnValid(number: string): boolean {
  const d = digitsOnly(number);
  if (d.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i += 1) {
    let digit = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** "1225" → "12/25"; a single leading 2..9 becomes "0N/". */
export function formatExpiry(input: string): string {
  let d = digitsOnly(input).slice(0, 4);
  if (d.length === 1 && Number(d) > 1) d = `0${d}`;
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export const cvcLength = (brand: CardBrand): number => (brand === 'amex' ? 4 : 3);

export const formatCvc = (input: string, brand: CardBrand): string =>
  digitsOnly(input).slice(0, cvcLength(brand));

export type CardField = 'number' | 'expiry' | 'cvc';
export type CardErrorCode = 'required' | 'cardNumber' | 'cardExpiry' | 'cardExpired' | 'cardCvc';

export interface CardInput {
  number: string;
  expiry: string;
  cvc: string;
}

/** First problem per field, as a message code. An empty object means the card looks valid. */
export function validateCard(
  card: CardInput,
  now: Date,
): Partial<Record<CardField, CardErrorCode>> {
  const errors: Partial<Record<CardField, CardErrorCode>> = {};
  const brand = detectBrand(card.number);

  if (digitsOnly(card.number) === '') errors.number = 'required';
  else if (!luhnValid(card.number) || digitsOnly(card.number).length !== maxDigits(brand)) {
    errors.number = 'cardNumber';
  }

  const expiry = /^(\d{2})\/(\d{2})$/.exec(card.expiry);
  if (card.expiry === '') errors.expiry = 'required';
  else if (!expiry || Number(expiry[1]) < 1 || Number(expiry[1]) > 12) errors.expiry = 'cardExpiry';
  else {
    const year = 2000 + Number(expiry[2]);
    const month = Number(expiry[1]);
    const thisYear = now.getUTCFullYear();
    const thisMonth = now.getUTCMonth() + 1;
    if (year < thisYear || (year === thisYear && month < thisMonth)) errors.expiry = 'cardExpired';
  }

  if (card.cvc === '') errors.cvc = 'required';
  else if (digitsOnly(card.cvc).length !== cvcLength(brand)) errors.cvc = 'cardCvc';

  return errors;
}

export type ChargeOutcome = 'approved' | 'declined';

/**
 * The pretend payment processor: only the documented test card is declined. The outcome is
 * decided here, in the browser, so no card data ever reaches the order repository.
 */
export function simulateCharge(number: string): ChargeOutcome {
  return digitsOnly(number) === digitsOnly(TEST_CARD_DECLINED) ? 'declined' : 'approved';
}

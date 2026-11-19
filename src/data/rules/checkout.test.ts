import { describe, expect, it } from 'vitest';
import {
  cvcLength,
  detectBrand,
  formatCardNumber,
  formatCvc,
  formatExpiry,
  luhnValid,
  simulateCharge,
  TEST_CARD_APPROVED,
  TEST_CARD_DECLINED,
  validateCard,
} from './card';
import { normalizeEgyptPhone, validateAddress, validateCheckout } from './checkout-schema';

const NOW = new Date('2026-11-19T10:00:00Z');

describe('card formatting and brand', () => {
  it('groups digits and detects the brand', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    expect(formatCardNumber('4242 4242 42')).toBe('4242 4242 42');
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
    expect(formatCardNumber('abc424242424242424249999')).toBe('4242 4242 4242 4242');
    expect(detectBrand('4242')).toBe('visa');
    expect(detectBrand('5555 5555')).toBe('mastercard');
    expect(detectBrand('2221 00')).toBe('mastercard');
    expect(detectBrand('3714')).toBe('amex');
    expect(detectBrand('5078 03')).toBe('meeza');
    expect(detectBrand('9999')).toBe('unknown');
  });

  it('formats expiry and CVC', () => {
    expect(formatExpiry('1')).toBe('1');
    expect(formatExpiry('5')).toBe('05');
    expect(formatExpiry('1225')).toBe('12/25');
    expect(formatExpiry('12/2')).toBe('12/2');
    expect(formatCvc('12345', 'visa')).toBe('123');
    expect(formatCvc('12345', 'amex')).toBe('1234');
    expect(cvcLength('mastercard')).toBe(3);
  });
});

describe('validateCard', () => {
  const good = { number: TEST_CARD_APPROVED, expiry: '12/30', cvc: '123' };

  it('accepts the documented test cards', () => {
    expect(luhnValid(TEST_CARD_APPROVED)).toBe(true);
    expect(luhnValid(TEST_CARD_DECLINED)).toBe(true);
    expect(validateCard(good, NOW)).toEqual({});
    expect(validateCard({ ...good, number: TEST_CARD_DECLINED }, NOW)).toEqual({});
  });

  it('reports each bad field with a code', () => {
    expect(validateCard({ number: '', expiry: '', cvc: '' }, NOW)).toEqual({
      number: 'required',
      expiry: 'required',
      cvc: 'required',
    });
    expect(validateCard({ ...good, number: '4242 4242 4242 4241' }, NOW).number).toBe('cardNumber');
    expect(validateCard({ ...good, number: '4242 4242' }, NOW).number).toBe('cardNumber');
    expect(validateCard({ ...good, expiry: '13/30' }, NOW).expiry).toBe('cardExpiry');
    expect(validateCard({ ...good, expiry: '1/3' }, NOW).expiry).toBe('cardExpiry');
    expect(validateCard({ ...good, expiry: '10/26' }, NOW).expiry).toBe('cardExpired');
    expect(validateCard({ ...good, expiry: '11/26' }, NOW).expiry).toBeUndefined();
    expect(validateCard({ ...good, cvc: '12' }, NOW).cvc).toBe('cardCvc');
  });

  it('wants four digits for an Amex CVC', () => {
    const amex = { number: '378282246310005', expiry: '12/30', cvc: '123' };
    expect(validateCard(amex, NOW).cvc).toBe('cardCvc');
    expect(validateCard({ ...amex, cvc: '1234' }, NOW)).toEqual({});
  });

  it('declines only the documented test card', () => {
    expect(simulateCharge(TEST_CARD_DECLINED)).toBe('declined');
    expect(simulateCharge('4000000000000002')).toBe('declined');
    expect(simulateCharge(TEST_CARD_APPROVED)).toBe('approved');
    expect(simulateCharge('5555 5555 5555 4444')).toBe('approved');
  });
});

describe('normalizeEgyptPhone', () => {
  it('accepts the usual ways of writing a mobile number', () => {
    for (const input of [
      '01012345678',
      '+20 10 1234 5678',
      '0020 101 234 5678',
      '010-1234-5678',
      '201012345678',
    ]) {
      expect(normalizeEgyptPhone(input)).toBe('01012345678');
    }
    expect(normalizeEgyptPhone('٠١٠١٢٣٤٥٦٧٨')).toBe('01012345678');
  });

  it('rejects numbers that are not Egyptian mobiles', () => {
    for (const input of ['', '0101234567', '01312345678', '02 2345 6789', '+971501234567', 'abc']) {
      expect(normalizeEgyptPhone(input)).toBeNull();
    }
  });
});

const validAddress = {
  fullName: 'Mona Adel',
  phone: '+20 100 123 4567',
  governorate: 'cairo',
  city: 'Nasr City',
  street: '12 Abbas El Akkad St',
  notes: '',
};

describe('validateAddress / validateCheckout', () => {
  it('accepts a good address and normalises the phone', () => {
    const result = validateAddress(validAddress);
    expect(result).toMatchObject({ ok: true });
    expect(result.ok && result.data.phone).toBe('01001234567');
  });

  it('returns one code per bad field, never the typed value', () => {
    const result = validateAddress({
      fullName: ' ',
      phone: '123',
      governorate: '',
      city: 'x',
      street: 'abc',
      notes: 'n'.repeat(300),
    });
    expect(result).toEqual({
      ok: false,
      errors: {
        fullName: 'required',
        phone: 'phone',
        governorate: 'required',
        city: 'tooShort',
        street: 'tooShort',
        notes: 'tooLong',
      },
    });
  });

  it('rejects an unknown governorate', () => {
    expect(validateAddress({ ...validAddress, governorate: 'atlantis' })).toMatchObject({
      ok: false,
      errors: { governorate: 'required' },
    });
  });

  it('checks the email and shipping method on top of the address', () => {
    const values = {
      ...validAddress,
      email: 'mona@example.com',
      shippingMethod: 'express' as const,
    };
    expect(validateCheckout(values)).toMatchObject({ ok: true });
    expect(validateCheckout({ ...values, email: 'mona@' })).toMatchObject({
      ok: false,
      errors: { email: 'email' },
    });
    expect(validateCheckout({ ...values, email: '' })).toMatchObject({
      errors: { email: 'required' },
    });
  });
});

import { z } from 'zod';
import { GOVERNORATE_IDS } from '../governorates';
import { SHIPPING_METHODS } from './shipping';

/**
 * Checkout and address validation. Every message is a code (see the `errors` namespace in the
 * i18n files); the UI translates it, so the same schema serves Arabic and English.
 */

/** "+20 10 1234 5678", "0020…", "010…" → "01012345678"; null when it is not an Egyptian mobile. */
export function normalizeEgyptPhone(input: string): string | null {
  const digits = input
    .replace(/[\s\-().]/g, '')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  const local = digits.replace(/^(\+20|0020)/, '0').replace(/^20(?=1\d{9}$)/, '0');
  return /^01[0125]\d{8}$/.test(local) ? local : null;
}

const phone = z
  .string()
  .trim()
  .min(1, 'required')
  .refine((value) => normalizeEgyptPhone(value) !== null, 'phone')
  .transform((value) => normalizeEgyptPhone(value) ?? value);

const text = (min: number, max: number) =>
  z.string().trim().min(1, 'required').min(min, 'tooShort').max(max, 'tooLong');

export const addressSchema = z.object({
  fullName: text(3, 80),
  phone,
  governorate: z.string().min(1, 'required').pipe(z.enum(GOVERNORATE_IDS, 'required')),
  city: text(2, 60),
  street: text(5, 160),
  notes: z.string().trim().max(200, 'tooLong'),
});

export const checkoutSchema = addressSchema.extend({
  email: z.string().trim().min(1, 'required').pipe(z.email('email')),
  shippingMethod: z.enum(SHIPPING_METHODS.map((m) => m.id) as ['standard', 'express']),
});

export type AddressValues = z.input<typeof addressSchema>;
export type AddressData = z.output<typeof addressSchema>;
export type CheckoutValues = z.input<typeof checkoutSchema>;
export type CheckoutData = z.output<typeof checkoutSchema>;

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

export type Validation<Data, K extends string> =
  { ok: true; data: Data } | { ok: false; errors: FieldErrors<K> };

/** Keeps the first message per field, in form order, so the UI can show one error under each. */
function firstErrors<K extends string>(error: z.ZodError): FieldErrors<K> {
  const errors: Partial<Record<string, string>> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '');
    errors[key] ??= issue.message;
  }
  return errors as FieldErrors<K>;
}

export function validateAddress(
  values: AddressValues,
): Validation<AddressData, keyof AddressValues> {
  const result = addressSchema.safeParse(values);
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, errors: firstErrors(result.error) };
}

export function validateCheckout(
  values: CheckoutValues,
): Validation<CheckoutData, keyof CheckoutValues> {
  const result = checkoutSchema.safeParse(values);
  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, errors: firstErrors(result.error) };
}

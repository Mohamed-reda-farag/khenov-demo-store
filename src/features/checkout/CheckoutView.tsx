'use client';

import { AlertTriangle, Banknote, CreditCard, Lock, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { Button, buttonClasses } from '@/components/ui/Button';
import { ErrorSummary, type ErrorSummaryItem } from '@/components/ui/ErrorSummary';
import { TextField } from '@/components/ui/Field';
import { RadioCard } from '@/components/ui/RadioCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/StateBlocks';
import { addressesRepository, ordersRepository } from '@/data/repository';
import { defaultAddress } from '@/data/rules/addresses';
import { simulateCharge, validateCard, type CardInput } from '@/data/rules/card';
import {
  validateCheckout,
  type CheckoutValues,
  type FieldErrors,
} from '@/data/rules/checkout-schema';
import { isBlocking, type LineIssue } from '@/data/rules/line-check';
import { OrderError } from '@/data/rules/place-order';
import { estimateDelivery, SHIPPING_METHODS } from '@/data/rules/shipping';
import type { Address, PaymentMethod } from '@/data/types';
import { governorateName } from '@/data/governorates';
import { useCartStore } from '@/features/cart/cart.store';
import { useCartCheck } from '@/features/cart/useCartCheck';
import { useCartPricing } from '@/features/cart/useCartPricing';
import { Link, useRouter } from '@/i18n/navigation';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';
import { useNow } from '@/lib/hooks/useNow';
import { AddressFields, type AddressField } from './AddressFields';
import { CardFields } from './CardFields';
import { CheckoutSummary } from './CheckoutSummary';
import { useErrorText } from './useErrorText';

const EMPTY_VALUES: CheckoutValues = {
  email: '',
  phone: '',
  fullName: '',
  governorate: '',
  city: '',
  street: '',
  notes: '',
  shippingMethod: 'standard',
};
const EMPTY_CARD: CardInput = { number: '', expiry: '', cvc: '' };
const NEW_ADDRESS = 'new';

type FormField = keyof CheckoutValues;
type SummaryField = Exclude<FormField, 'shippingMethod'>;
const FIELD_ORDER: readonly SummaryField[] = [
  'email',
  'phone',
  'fullName',
  'governorate',
  'city',
  'street',
  'notes',
];

type Failure =
  | { kind: 'declined' }
  | { kind: 'stock'; issues: readonly LineIssue[] }
  | { kind: 'promo' }
  | { kind: 'network' };

async function loadDefaults() {
  const [addresses, orders] = await Promise.all([
    addressesRepository.list(),
    ordersRepository.list(),
  ]);
  return { addresses, lastEmail: orders[0]?.contact.email ?? '' };
}

export function CheckoutSkeleton() {
  return (
    <div role="status" aria-busy className="container-page py-8">
      <Skeleton className="mb-8 h-9 w-56" />
      <div aria-hidden className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  const format = useFormat();
  return (
    <section aria-labelledby={`checkout-h-${number}`} className="flex flex-col gap-4">
      <h2
        id={`checkout-h-${number}`}
        className="flex items-center gap-3 font-display text-xl font-semibold"
      >
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-full bg-ink-900 text-sm text-paper"
        >
          {format.number(number)}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckoutView() {
  const t = useTranslations('checkout');
  const cart = useTranslations('cart');
  const address = useTranslations('address');
  const format = useFormat();
  const text = useErrorText();
  const router = useRouter();
  const now = useNow(10 * 60_000);

  const hydrated = useCartStore((s) => s.hydrated);
  const lines = useCartStore((s) => s.lines);
  const promoCode = useCartStore((s) => s.promoCode);
  const clearCart = useCartStore((s) => s.clear);
  const check = useCartCheck(lines);
  const defaults = useAsync('checkout-defaults', loadDefaults);

  const [values, setValues] = useState<CheckoutValues>(EMPTY_VALUES);
  const [card, setCard] = useState<CardInput>(EMPTY_CARD);
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [addressChoice, setAddressChoice] = useState<string>(NEW_ADDRESS);
  const [saveAddress, setSaveAddress] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [focusSignal, setFocusSignal] = useState(0);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const submitting = useRef(false);

  const pricing = useCartPricing(values.shippingMethod);

  const addresses = defaults.status === 'success' ? defaults.data.addresses : [];

  const applySavedAddress = (address: Address) => {
    setAddressChoice(address.id);
    setValues((v) => ({
      ...v,
      phone: address.phone,
      fullName: address.fullName,
      governorate: address.governorate,
      city: address.city,
      street: address.street,
      notes: address.notes,
    }));
  };

  // Once the saved addresses arrive, start from the default one (adjusting state while rendering).
  if (!prefilled && defaults.status === 'success') {
    setPrefilled(true);
    const preferred = defaultAddress(defaults.data.addresses);
    setValues((v) => ({ ...v, email: defaults.data.lastEmail }));
    if (preferred) applySavedAddress(preferred);
  }

  const validation = useMemo(() => validateCheckout(values), [values]);
  const cardErrors = useMemo(
    () => (payment === 'card' ? validateCard(card, now) : {}),
    [payment, card, now],
  );

  const fieldErrors: FieldErrors<FormField> = attempted && !validation.ok ? validation.errors : {};
  const shownCardErrors = attempted ? cardErrors : {};
  const fieldLabel = (field: SummaryField): string =>
    field === 'email' ? t('email') : field === 'phone' ? t('phone') : address(field);
  const cardLabel = (field: 'number' | 'expiry' | 'cvc'): string =>
    t(field === 'number' ? 'cardNumber' : field === 'expiry' ? 'cardExpiry' : 'cardCvc');
  const summaryItems: ErrorSummaryItem[] = [
    ...FIELD_ORDER.flatMap((field) => {
      const message = text(fieldErrors[field]);
      return message ? [{ fieldId: `checkout-${field}`, label: fieldLabel(field), message }] : [];
    }),
    ...(['number', 'expiry', 'cvc'] as const).flatMap((field) => {
      const message = text(shownCardErrors[field]);
      return message
        ? [{ fieldId: `checkout-card-${field}`, label: cardLabel(field), message }]
        : [];
    }),
  ];

  const setField = (field: FormField, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (addressChoice !== NEW_ADDRESS && field !== 'email' && field !== 'phone') {
      setAddressChoice(NEW_ADDRESS);
    }
  };

  const blocking = check.issues.filter(isBlocking);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting.current) return;
    setAttempted(true);
    if (!validation.ok || Object.keys(cardErrors).length > 0) {
      setFocusSignal((n) => n + 1);
      return;
    }
    const data = validation.data;
    submitting.current = true;
    setPending(true);
    setFailure(null);
    try {
      const order = await ordersRepository.place({
        lines,
        contact: { email: data.email, phone: data.phone },
        shipping: {
          fullName: data.fullName,
          governorate: data.governorate,
          city: data.city,
          street: data.street,
          notes: data.notes,
        },
        shippingMethod: data.shippingMethod,
        payment:
          payment === 'card'
            ? { method: 'card', outcome: simulateCharge(card.number) }
            : { method: 'cod' },
        promoCode: promoCode ?? undefined,
      });
      if (saveAddress && addressChoice === NEW_ADDRESS) {
        await addressesRepository
          .save({
            fullName: data.fullName,
            phone: data.phone,
            governorate: data.governorate,
            city: data.city,
            street: data.street,
            notes: data.notes,
          })
          .catch(() => undefined);
      }
      setCard(EMPTY_CARD);
      setDone(true);
      clearCart();
      router.replace(`/order?id=${order.id}&placed=1`);
    } catch (error) {
      if (error instanceof OrderError && error.code === 'PAYMENT_DECLINED') {
        setFailure({ kind: 'declined' });
      } else if (error instanceof OrderError && error.code === 'STOCK_CHANGED') {
        setFailure({ kind: 'stock', issues: error.issues });
      } else if (error instanceof OrderError && error.code === 'PROMO_INVALID') {
        setFailure({ kind: 'promo' });
      } else {
        setFailure({ kind: 'network' });
      }
      submitting.current = false;
      setPending(false);
    }
  };

  if (!hydrated || done) return <CheckoutSkeleton />;

  if (lines.length === 0) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon={<ShoppingBag aria-hidden className="size-7" />}
          title={cart('emptyTitle')}
          body={t('emptyBody')}
          action={
            <Link href="/shop" className={buttonClasses({})}>
              {cart('emptyCta')}
            </Link>
          }
        />
      </div>
    );
  }

  const shippingLabel = t(`method.${values.shippingMethod}`);

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold">{t('title')}</h1>
        <p className="mt-1 text-ink-500">{t('guestNote')}</p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
        <div className="lg:order-2">
          <CheckoutSummary
            lines={lines}
            totals={pricing.totals}
            promo={pricing.promo}
            shippingLabel={shippingLabel}
            locked={pending}
          />
        </div>

        <form
          noValidate
          onSubmit={submit}
          className="flex flex-col gap-10 lg:order-1"
          aria-busy={pending}
        >
          <ErrorSummary title={t('errorSummary')} items={summaryItems} focusSignal={focusSignal} />

          {blocking.length > 0 ? (
            <div role="alert" className="rounded-md bg-danger-100 p-4 text-sm text-danger-600">
              <p className="font-medium">{t('stockProblem')}</p>
              <Link
                href="/cart"
                className="mt-1 inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
              >
                {cart('reviewCart')}
              </Link>
            </div>
          ) : null}

          <Section number={1} title={t('contact')}>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <TextField
                id="checkout-email"
                label={t('email')}
                type="email"
                inputMode="email"
                dir="ltr"
                autoComplete="email"
                value={values.email}
                error={text(fieldErrors.email)}
                onChange={(e) => setField('email', e.target.value)}
                className="text-start"
              />
              <TextField
                id="checkout-phone"
                label={t('phone')}
                hint={t('phoneHint')}
                type="tel"
                inputMode="tel"
                dir="ltr"
                autoComplete="tel"
                value={values.phone}
                error={text(fieldErrors.phone)}
                onChange={(e) => setField('phone', e.target.value)}
                className="text-start"
              />
            </div>
          </Section>

          <Section number={2} title={t('address')}>
            {addresses.length > 0 ? (
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-2 text-sm font-medium">{t('savedAddresses')}</legend>
                {addresses.map((address) => (
                  <RadioCard
                    key={address.id}
                    name="address-choice"
                    checked={addressChoice === address.id}
                    onChange={() => applySavedAddress(address)}
                    title={address.fullName}
                  >
                    {format.list([
                      address.street,
                      address.city,
                      format.text(governorateName(address.governorate) ?? { ar: '', en: '' }),
                    ])}
                  </RadioCard>
                ))}
                <RadioCard
                  name="address-choice"
                  checked={addressChoice === NEW_ADDRESS}
                  onChange={() => {
                    setAddressChoice(NEW_ADDRESS);
                    setValues((v) => ({
                      ...v,
                      fullName: '',
                      governorate: '',
                      city: '',
                      street: '',
                      notes: '',
                    }));
                  }}
                  title={t('newAddress')}
                />
              </fieldset>
            ) : null}
            {addressChoice === NEW_ADDRESS ? (
              <>
                <AddressFields
                  idPrefix="checkout"
                  values={values}
                  errors={fieldErrors as Partial<Record<AddressField, string>>}
                  onChange={(field, value) => setField(field, value)}
                />
                <label className="-mt-2 flex min-h-11 items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="size-5 accent-ink-900"
                  />
                  {t('saveAddress')}
                </label>
              </>
            ) : null}
          </Section>

          <Section number={3} title={t('delivery')}>
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">{t('delivery')}</legend>
              {SHIPPING_METHODS.map((method) => {
                const estimate = estimateDelivery(method.id, now);
                const fee =
                  method.id === 'standard' && pricing.totals.freeShipping
                    ? cart('shippingFree')
                    : format.price(method.priceEGP);
                const dates = format.date(estimate.from, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });
                const datesTo = format.date(estimate.to, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                });
                return (
                  <RadioCard
                    key={method.id}
                    name="shipping-method"
                    value={method.id}
                    checked={values.shippingMethod === method.id}
                    onChange={() => setValues((v) => ({ ...v, shippingMethod: method.id }))}
                    title={t(`method.${method.id}`)}
                    aside={
                      pricing.promo?.ok && pricing.promo.freeShipping ? cart('shippingFree') : fee
                    }
                  >
                    {t('estimate', { from: dates, to: datesTo })}
                  </RadioCard>
                );
              })}
            </fieldset>
          </Section>

          <Section number={4} title={t('payment')}>
            <p className="flex items-start gap-2 rounded-md bg-warning-100 p-4 text-sm text-warning-700">
              <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
              {t('demoNotice')}
            </p>
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">{t('payment')}</legend>
              <RadioCard
                name="payment-method"
                value="card"
                checked={payment === 'card'}
                onChange={() => setPayment('card')}
                title={
                  <span className="inline-flex items-center gap-2">
                    <CreditCard aria-hidden className="size-5" />
                    {t('payCard')}
                  </span>
                }
              >
                {t('payCardHint')}
              </RadioCard>
              <RadioCard
                name="payment-method"
                value="cod"
                checked={payment === 'cod'}
                onChange={() => setPayment('cod')}
                title={
                  <span className="inline-flex items-center gap-2">
                    <Banknote aria-hidden className="size-5" />
                    {t('payCod')}
                  </span>
                }
              >
                {t('payCodHint')}
              </RadioCard>
            </fieldset>
            {payment === 'card' ? (
              <CardFields
                card={card}
                errors={shownCardErrors}
                onChange={setCard}
                disabled={pending}
              />
            ) : null}
          </Section>

          <div aria-live="assertive" className="flex flex-col gap-3 empty:hidden">
            {failure?.kind === 'declined' ? (
              <FailureBanner title={t('declinedTitle')} body={t('declinedBody')} />
            ) : null}
            {failure?.kind === 'stock' ? (
              <FailureBanner title={t('stockProblem')} body={t('stockChangedBody')}>
                <Link
                  href="/cart"
                  className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
                >
                  {cart('reviewCart')}
                </Link>
              </FailureBanner>
            ) : null}
            {failure?.kind === 'promo' ? (
              <FailureBanner title={t('promoProblem')} body={t('promoProblemBody')} />
            ) : null}
            {failure?.kind === 'network' ? (
              <FailureBanner title={t('networkTitle')} body={t('networkBody')} />
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={pending}
              disabled={blocking.length > 0}
            >
              {pending
                ? t('processing')
                : payment === 'card'
                  ? t('payNow', { total: format.price(pricing.totals.total) })
                  : t('placeOrder', { total: format.price(pricing.totals.total) })}
            </Button>
            <p role="status" className="sr-only">
              {pending ? t('processingStatus') : ''}
            </p>
            <p className="text-center text-xs text-ink-500">{t('termsNote')}</p>
          </div>
        </form>
      </div>
    </div>
  );
}

function FailureBanner({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-danger-600 bg-danger-100 p-4 text-sm">
      <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-danger-600" />
      <div>
        <p className="font-semibold text-danger-600">{title}</p>
        <p className="text-ink-700">{body}</p>
        {children}
      </div>
    </div>
  );
}

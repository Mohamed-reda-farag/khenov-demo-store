'use client';

import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { ErrorSummary, type ErrorSummaryItem } from '@/components/ui/ErrorSummary';
import { IconButton } from '@/components/ui/IconButton';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState, ErrorState } from '@/components/ui/StateBlocks';
import { toast } from '@/components/ui/toast';
import { governorateName } from '@/data/governorates';
import { addressesRepository } from '@/data/repository';
import { validateAddress, type AddressValues } from '@/data/rules/checkout-schema';
import type { Address } from '@/data/types';
import { AddressFields, type AddressField } from '@/features/checkout/AddressFields';
import { useErrorText } from '@/features/checkout/useErrorText';
import { useAsync } from '@/lib/hooks/useAsync';
import { useFormat } from '@/lib/hooks/useFormat';

const EMPTY: AddressValues = {
  fullName: '',
  phone: '',
  governorate: '',
  city: '',
  street: '',
  notes: '',
};
const FIELDS: readonly AddressField[] = [
  'fullName',
  'phone',
  'governorate',
  'city',
  'street',
  'notes',
];

interface FormProps {
  editing: Address | null;
  onClose: () => void;
  onSaved: () => void;
}

function AddressForm({ editing, onClose, onSaved }: FormProps) {
  const t = useTranslations('account');
  const address = useTranslations('address');
  const text = useErrorText();
  const [values, setValues] = useState<AddressValues>(
    editing
      ? {
          fullName: editing.fullName,
          phone: editing.phone,
          governorate: editing.governorate,
          city: editing.city,
          street: editing.street,
          notes: editing.notes,
        }
      : EMPTY,
  );
  const [makeDefault, setMakeDefault] = useState(editing?.isDefault ?? false);
  const [attempted, setAttempted] = useState(false);
  const [focusSignal, setFocusSignal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const result = validateAddress(values);
  const errors = attempted && !result.ok ? result.errors : {};
  const items: ErrorSummaryItem[] = FIELDS.flatMap((field) => {
    const message = text(errors[field]);
    return message ? [{ fieldId: `address-${field}`, label: address(field), message }] : [];
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    setAttempted(true);
    if (!result.ok) {
      setFocusSignal((n) => n + 1);
      return;
    }
    setSaving(true);
    setFailed(false);
    try {
      await addressesRepository.save({
        ...result.data,
        ...(editing ? { id: editing.id } : {}),
        isDefault: makeDefault,
      });
      toast.success(editing ? t('addressUpdated') : t('addressAdded'));
      onSaved();
    } catch {
      setFailed(true);
      setSaving(false);
    }
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <ErrorSummary title={t('errorSummary')} items={items} focusSignal={focusSignal} />
      <AddressFields
        idPrefix="address"
        showPhone
        values={values}
        errors={errors as Partial<Record<AddressField, string>>}
        onChange={(field, value) => setValues((v) => ({ ...v, [field]: value }))}
      />
      <label className="-mt-2 flex min-h-11 items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={makeDefault}
          onChange={(e) => setMakeDefault(e.target.checked)}
          className="size-5 accent-ink-900"
        />
        {t('makeDefault')}
      </label>
      {failed ? (
        <p role="alert" className="text-sm font-medium text-danger-600">
          {t('saveFailed')}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          {t('cancel')}
        </Button>
        <Button type="submit" loading={saving}>
          {t('saveAddress')}
        </Button>
      </div>
    </form>
  );
}

export function AddressesSection() {
  const t = useTranslations('account');
  const states = useTranslations('states');
  const common = useTranslations('common');
  const format = useFormat();
  const state = useAsync('account-addresses', () => addressesRepository.list());
  const [dialog, setDialog] = useState<{ editing: Address | null } | null>(null);

  const list =
    state.status === 'success'
      ? state.data
      : state.status === 'loading'
        ? state.previous
        : undefined;
  const refresh = state.status === 'loading' ? () => undefined : state.retry;

  const remove = async (address: Address) => {
    try {
      await addressesRepository.remove(address.id);
      refresh();
      toast.show({
        message: t('addressRemoved'),
        action: {
          label: t('undo'),
          onAction: () => {
            void addressesRepository
              .save({
                fullName: address.fullName,
                phone: address.phone,
                governorate: address.governorate,
                city: address.city,
                street: address.street,
                notes: address.notes,
                isDefault: address.isDefault,
              })
              .then(refresh);
          },
        },
      });
    } catch {
      toast.show({ message: t('removeFailed'), tone: 'error' });
    }
  };

  const makeDefault = async (address: Address) => {
    try {
      await addressesRepository.save({ ...address, isDefault: true });
      refresh();
    } catch {
      toast.show({ message: t('saveFailed'), tone: 'error' });
    }
  };

  return (
    <section id="addresses" aria-labelledby="addresses-title" className="scroll-mt-28">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="addresses-title" className="font-display text-2xl font-semibold">
          {t('addressesTitle')}
        </h2>
        {list && list.length > 0 ? (
          <Button variant="secondary" onClick={() => setDialog({ editing: null })}>
            <Plus aria-hidden className="size-4" />
            {t('addAddress')}
          </Button>
        ) : null}
      </div>

      {state.status === 'error' ? (
        <ErrorState
          title={states('errorTitle')}
          body={states('errorBody')}
          retryLabel={common('retry')}
          onRetry={state.retry}
        />
      ) : list === undefined ? (
        <div role="status" aria-busy>
          <Skeleton className="h-28 w-full rounded-lg" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<MapPin aria-hidden className="size-7" />}
          title={t('addressesEmptyTitle')}
          body={t('addressesEmptyBody')}
          action={<Button onClick={() => setDialog({ editing: null })}>{t('addAddress')}</Button>}
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((address) => (
            <li
              key={address.id}
              className="flex flex-col gap-3 rounded-lg border border-sand-200 p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {address.fullName}
                    {address.isDefault ? (
                      <span className="rounded-pill bg-sand-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                        {t('defaultBadge')}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm text-ink-700">
                    {format.list([
                      address.street,
                      address.city,
                      format.text(governorateName(address.governorate) ?? { ar: '', en: '' }),
                    ])}
                  </p>
                  <bdi dir="ltr" className="mt-1 block text-sm text-ink-500">
                    {address.phone}
                  </bdi>
                </div>
                <div className="-me-2 -mt-2 flex">
                  <IconButton
                    label={t('editAddress', { name: address.fullName })}
                    onClick={() => setDialog({ editing: address })}
                  >
                    <Pencil aria-hidden className="size-4" />
                  </IconButton>
                  <IconButton
                    label={t('removeAddress', { name: address.fullName })}
                    onClick={() => void remove(address)}
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </IconButton>
                </div>
              </div>
              {address.isDefault ? null : (
                <button
                  type="button"
                  onClick={() => void makeDefault(address)}
                  className="-ms-2 inline-flex min-h-11 w-fit items-center rounded-pill px-2 text-sm font-medium underline underline-offset-4"
                >
                  {t('setDefault')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={dialog !== null}
        onClose={() => setDialog(null)}
        title={dialog?.editing ? t('editAddressTitle') : t('addAddressTitle')}
      >
        {dialog ? (
          <AddressForm
            key={dialog.editing?.id ?? 'new'}
            editing={dialog.editing}
            onClose={() => setDialog(null)}
            onSaved={() => {
              setDialog(null);
              refresh();
            }}
          />
        ) : null}
      </Modal>
    </section>
  );
}

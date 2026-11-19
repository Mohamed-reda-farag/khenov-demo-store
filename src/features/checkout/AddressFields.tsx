'use client';

import { useTranslations } from 'next-intl';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Field';
import { GOVERNORATES } from '@/data/governorates';
import type { AddressValues } from '@/data/rules/checkout-schema';
import { useFormat } from '@/lib/hooks/useFormat';
import { useErrorText } from './useErrorText';

export type AddressField = keyof AddressValues;

interface AddressFieldsProps {
  values: AddressValues;
  /** Validation codes by field (already filtered to what should be shown). */
  errors: Partial<Record<AddressField, string>>;
  onChange: (field: AddressField, value: string) => void;
  /** Prefix for the input ids, so two forms never clash and error links can find the field. */
  idPrefix: string;
  showPhone?: boolean;
}

/** Recipient name, optional phone, governorate, city, street and notes. Shared by checkout and the account page. */
export function AddressFields({
  values,
  errors,
  onChange,
  idPrefix,
  showPhone = false,
}: AddressFieldsProps) {
  const t = useTranslations('address');
  const format = useFormat();
  const text = useErrorText();
  const id = (field: AddressField) => `${idPrefix}-${field}`;

  return (
    <div className="grid gap-x-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <TextField
          id={id('fullName')}
          label={t('fullName')}
          autoComplete="name"
          value={values.fullName}
          error={text(errors.fullName)}
          onChange={(e) => onChange('fullName', e.target.value)}
        />
      </div>
      {showPhone ? (
        <div className="sm:col-span-2">
          <TextField
            id={id('phone')}
            label={t('phone')}
            hint={t('phoneHint')}
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            value={values.phone}
            error={text(errors.phone)}
            onChange={(e) => onChange('phone', e.target.value)}
          />
        </div>
      ) : null}
      <SelectField
        id={id('governorate')}
        label={t('governorate')}
        autoComplete="address-level1"
        value={values.governorate}
        error={text(errors.governorate)}
        onChange={(e) => onChange('governorate', e.target.value)}
      >
        <option value="">{t('governoratePlaceholder')}</option>
        {GOVERNORATES.map((g) => (
          <option key={g.id} value={g.id}>
            {format.text(g.name)}
          </option>
        ))}
      </SelectField>
      <TextField
        id={id('city')}
        label={t('city')}
        autoComplete="address-level2"
        value={values.city}
        error={text(errors.city)}
        onChange={(e) => onChange('city', e.target.value)}
      />
      <div className="sm:col-span-2">
        <TextField
          id={id('street')}
          label={t('street')}
          hint={t('streetHint')}
          autoComplete="street-address"
          value={values.street}
          error={text(errors.street)}
          onChange={(e) => onChange('street', e.target.value)}
        />
      </div>
      <div className="sm:col-span-2">
        <TextAreaField
          id={id('notes')}
          label={t('notes')}
          optionalLabel={t('optional')}
          hint={t('notesHint')}
          rows={2}
          value={values.notes}
          error={text(errors.notes)}
          onChange={(e) => onChange('notes', e.target.value)}
        />
      </div>
    </div>
  );
}

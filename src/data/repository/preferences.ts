import { prefsStorage } from '@/lib/demo/storage';
import { LOCALES, type Locale } from '../types';

/** Synchronous on purpose: the root redirect needs the answer before first paint. */
export interface PreferencesRepository {
  getLocale(): Locale | null;
  setLocale(locale: Locale): void;
}

export const localPreferencesRepository: PreferencesRepository = {
  getLocale() {
    const value = prefsStorage.get('locale');
    return LOCALES.find((l) => l === value) ?? null;
  },
  setLocale(locale) {
    prefsStorage.set('locale', locale);
  },
};

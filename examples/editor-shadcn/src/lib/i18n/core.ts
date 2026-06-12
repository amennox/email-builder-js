import en from './en';
import it from './it';

export type TLocale = 'it' | 'en';
export type TranslationKey = keyof typeof it;

const DICTIONARIES: Record<TLocale, Record<TranslationKey, string>> = { it, en };

export const LOCALE_STORAGE_KEY = 'editor:locale';

export function getInitialLocale(): TLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'it' || stored === 'en') {
      return stored;
    }
  } catch {
    // localStorage non disponibile (es. test): fallback al default
  }
  return 'it';
}

export function translate(locale: TLocale, key: TranslationKey): string {
  return DICTIONARIES[locale][key];
}

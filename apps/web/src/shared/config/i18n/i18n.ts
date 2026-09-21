import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';
import { ru } from './locales/ru';

export const LANGUAGES = ['en', 'ru'] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

/** Shown in the footer switcher. Uppercase two-letter codes, as in the source. */
export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'EN',
  ru: 'RU',
};

/** Native language names keep the picker intelligible as more locales arrive. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
};

export const LANGUAGE_STORAGE_KEY = 'intentra.language';

/** The landing reads its copy as a typed object (`useDict()`), not through
 * `t('a.b.c')` — the dictionary is deeply nested with arrays per band, and a
 * string key would throw away the types that keep en and ru in step. i18next
 * still owns detection, persistence and the change event; the dictionaries are
 * registered so anything outside the landing can use `t()` normally. */
export const dictionaries = { en, ru } as const;

void i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    supportedLngs: [...LANGUAGES],
    fallbackLng: DEFAULT_LANGUAGE,
    /* `ru-RU` and `ru` are the same bundle here. */
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export function isLanguage(value: string | undefined): value is Language {
  return LANGUAGES.includes(value as Language);
}

export function resolveLanguage(value: string | undefined): Language {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

export { i18next as i18n };

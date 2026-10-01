import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { readStored, writeStored } from '../lib';

export const LanguageSchema = z.enum(['ru', 'en']);

export type Language = z.infer<typeof LanguageSchema>;

const STORAGE_KEY = 'intentra.language';

/** The chosen language, else the browser's when it is one we have, else Russian. */
export function initialLanguage(): Language {
  const stored = LanguageSchema.safeParse(readStored(STORAGE_KEY));
  if (stored.success) return stored.data;

  const fromBrowser = navigator.languages
    .map(tag => LanguageSchema.safeParse(tag.slice(0, 2)))
    .find(result => result.success);
  return fromBrowser?.data ?? LanguageSchema.enum.ru;
}

/** Zod's own messages follow the interface's language. */
export function applyLanguage(language: Language): void {
  z.config(
    language === LanguageSchema.enum.en ? z.locales.en() : z.locales.ru(),
  );
}

/** Keeps <html lang> on the interface's language; the browser only. */
export function syncDocumentLanguage(): void {
  document.documentElement.lang = i18n.language;
  i18n.on('languageChanged', next => {
    document.documentElement.lang = next;
  });
}

export function useLanguage(): {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
} {
  const { i18n: instance } = useTranslation();

  return {
    language: LanguageSchema.catch(LanguageSchema.enum.ru).parse(
      instance.resolvedLanguage,
    ),
    setLanguage: language => {
      writeStored(STORAGE_KEY, language);
      void i18n.changeLanguage(language);
    },
  };
}

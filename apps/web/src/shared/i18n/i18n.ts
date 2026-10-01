import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { z } from 'zod';

import { applyLanguage, initialLanguage, LanguageSchema } from './language';
import { en } from './locales/en';
import { ru } from './locales/ru';
import { validationMessage } from './validation-message';

export const DEFAULT_NAMESPACE = 'translation';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NAMESPACE;
    resources: { [DEFAULT_NAMESPACE]: typeof ru };
  }
}

/**
 * Starts i18next and gives zod's messages the same language, in the product's
 * own words where the forms meet a check; called once, before rendering.
 */
export function initI18n(): void {
  const language = initialLanguage();
  void i18n.use(initReactI18next).init({
    lng: language,
    fallbackLng: LanguageSchema.enum.ru,
    defaultNS: DEFAULT_NAMESPACE,
    resources: {
      [LanguageSchema.enum.ru]: { [DEFAULT_NAMESPACE]: ru },
      [LanguageSchema.enum.en]: { [DEFAULT_NAMESPACE]: en },
    },
    interpolation: { escapeValue: false },
  });
  applyLanguage(language);
  i18n.on('languageChanged', next =>
    applyLanguage(LanguageSchema.catch(LanguageSchema.enum.ru).parse(next)),
  );
  z.config({
    customError: issue =>
      validationMessage(issue, (key, values) => i18n.t(key, values)),
  });
}

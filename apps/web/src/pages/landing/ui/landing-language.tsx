import { useTranslation } from 'react-i18next';

import { LanguageSchema, useLanguage } from '@/shared/i18n';

/** Both languages side by side, the current one marked; a click on the other switches. */
export function LandingLanguage() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  return (
    <div className='landing-language'>
      {LanguageSchema.options.map(code => (
        <button
          key={code}
          type='button'
          lang={code}
          aria-pressed={language === code}
          aria-label={t(`language.switchTo.${code}`)}
          onClick={() => setLanguage(code)}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

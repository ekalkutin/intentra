import { useTranslation } from 'react-i18next';

import { LanguageSchema, useLanguage } from '@/shared/i18n';
import { Button } from '@/shared/ui';

/** Flips between Russian and English in a single click; shows the current one. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const next =
    language === LanguageSchema.enum.ru
      ? LanguageSchema.enum.en
      : LanguageSchema.enum.ru;

  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label={t(`language.switchTo.${next}`)}
      lang={next}
      className={className}
      onClick={() => setLanguage(next)}
    >
      <span className='font-mono text-xs font-medium uppercase'>
        {language}
      </span>
    </Button>
  );
}

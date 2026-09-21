import { useAppDispatch, useAppSelector } from '@/app/store';
import { LANGUAGE_LABELS, LANGUAGES } from '@/shared/config/i18n';
import { cn } from '@/shared/lib/utils';

import { languageSelected, selectLanguage } from '../model/language-slice';

/* Ported from the reference footer: codes separated by a hairline, the current
 * one simply less transparent. No flag, no dropdown — with two languages a
 * menu is more chrome than choice.
 *
 * `variant` exists because the control now sits in the header, which is
 * transparent over the dark hero on the landing and solid white elsewhere; one
 * hardcoded palette would be wrong on half of them.
 *
 * The alpha steps are the ones that clear AA at 12px against each band: on
 * ink, white/55 measures 5.2:1 while white/45 only reaches 3.9:1. On white the
 * quiet step is `muted-foreground`, the token pinned to 4.5:1 for exactly this
 * case — an alpha there would land near 2.4:1. */
export function LanguageSwitch({
  variant = 'dark',
  className,
}: {
  variant?: 'dark' | 'light';
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const current = useAppSelector(selectLanguage);

  return (
    <div
      role='group'
      aria-label='Language'
      className={cn('flex items-center', className)}
    >
      {LANGUAGES.map((language, i) => {
        const isCurrent = language === current;

        return (
          <button
            type='button'
            key={language}
            aria-pressed={isCurrent}
            onClick={() => dispatch(languageSelected(language))}
            className={cn(
              'landing-affordance text-caption px-1.5 py-1 font-medium transition-colors',
              variant === 'dark'
                ? isCurrent
                  ? 'text-white'
                  : 'text-white/55 hover:text-white/80 active:text-white'
                : isCurrent
                  ? 'text-band-ink'
                  : 'text-muted-foreground hover:text-band-ink active:text-band-ink',
              i > 0 &&
                (variant === 'dark'
                  ? 'border-l border-white/16'
                  : 'border-band-ink/12 border-l'),
            )}
          >
            {LANGUAGE_LABELS[language]}
          </button>
        );
      })}
    </div>
  );
}

import { Languages } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/app/store';
import {
  isLanguage,
  LANGUAGE_LABELS,
  LANGUAGE_NAMES,
  LANGUAGES,
} from '@/shared/config/i18n';
import { cn } from '@/shared/lib/utils';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';

import { languageSelected, selectLanguage } from '../model/language-slice';

export function LanguageSwitch({
  variant = 'dark',
  className,
}: {
  variant?: 'dark' | 'light';
  className?: string;
}) {
  const dispatch = useAppDispatch();
  const current = useAppSelector(selectLanguage);
  const languages = LANGUAGES.map(language => ({
    label: LANGUAGE_NAMES[language],
    value: language,
  }));

  function selectLanguageOption(value: string | null) {
    const nextLanguage = value ?? undefined;

    if (isLanguage(nextLanguage)) {
      dispatch(languageSelected(nextLanguage));
    }
  }

  return (
    <Select
      items={languages}
      value={current}
      onValueChange={selectLanguageOption}
    >
      <SelectTrigger
        aria-label='Language'
        size='sm'
        className={cn(
          'landing-affordance gap-2 px-2.5 text-xs font-semibold tracking-[0.04em]',
          variant === 'dark'
            ? 'border-white/16 text-white/86 hover:bg-white/10 [&_[data-slot=select-value]]:text-white/86 [&_[data-slot=select-value]+svg]:text-white/55'
            : 'border-border/70 bg-background/80 text-band-ink hover:bg-muted/70 [&_[data-slot=select-value]+svg]:text-muted-foreground',
          className,
        )}
      >
        <Languages data-icon='inline-start' />
        <SelectValue>{LANGUAGE_LABELS[current]}</SelectValue>
      </SelectTrigger>
      <SelectContent align='end' alignItemWithTrigger={false}>
        <SelectGroup>
          {LANGUAGES.map(language => (
            <SelectItem key={language} value={language}>
              <span className='font-medium'>{LANGUAGE_NAMES[language]}</span>
              <span className='text-muted-foreground'>
                {LANGUAGE_LABELS[language]}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

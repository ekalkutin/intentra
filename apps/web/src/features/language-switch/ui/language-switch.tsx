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
  size = 'compact',
  className,
}: {
  variant?: 'dark' | 'light';
  size?: 'compact' | 'header';
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
        size={size === 'header' ? 'default' : 'sm'}
        className={cn(
          'landing-affordance gap-2 font-semibold tracking-[0.04em]',
          size === 'header'
            ? '!h-10 !rounded-(--landing-radius-button) px-4 text-label'
            : 'px-2.5 text-xs',
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

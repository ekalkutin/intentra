import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ThemeSchema, useTheme } from '@/shared/lib';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/shared/ui';

const ICONS = {
  [ThemeSchema.enum.system]: Monitor,
  [ThemeSchema.enum.light]: Sun,
  [ThemeSchema.enum.dark]: Moon,
};

/** The system's theme, the light one or the dark one. */
export function ThemeSwitch({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const Icon = ICONS[theme];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant='ghost'
            size='icon'
            aria-label={t('theme.label')}
            className={className}
          />
        }
      >
        <Icon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t('theme.label')}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={value => setTheme(ThemeSchema.parse(value))}
          >
            {ThemeSchema.options.map(option => {
              const OptionIcon = ICONS[option];
              return (
                <DropdownMenuRadioItem key={option} value={option}>
                  <OptionIcon />
                  {t(`theme.${option}`)}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

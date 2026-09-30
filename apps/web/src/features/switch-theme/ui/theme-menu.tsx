import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ThemeSchema, useTheme } from '@/shared/lib';
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/shared/ui';

const ICONS = {
  [ThemeSchema.enum.system]: Monitor,
  [ThemeSchema.enum.light]: Sun,
  [ThemeSchema.enum.dark]: Moon,
};

/** The theme choice as a submenu, for a menu that already exists. */
export function ThemeMenu() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const Icon = ICONS[theme];

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Icon />
        {t('theme.label')}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
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
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

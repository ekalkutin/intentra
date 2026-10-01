import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ThemeSchema, useTheme } from '@/shared/lib';
import { Button } from '@/shared/ui';

/** Flips between the light theme and the dark one in a single click. */
export function ThemeSwitch({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === ThemeSchema.enum.dark;
  const next = dark ? ThemeSchema.enum.light : ThemeSchema.enum.dark;

  return (
    <Button
      variant='ghost'
      size='icon'
      aria-label={t(`theme.switchTo.${next}`)}
      className={className}
      onClick={() => setTheme(next)}
    >
      {dark ? <Moon /> : <Sun />}
    </Button>
  );
}

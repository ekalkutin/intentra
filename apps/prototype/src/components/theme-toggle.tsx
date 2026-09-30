import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

/** Switches between the light and the dark theme. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === 'dark';
  const label = dark ? 'Светлая тема' : 'Тёмная тема';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='ghost'
          size='icon-sm'
          aria-label={label}
          aria-pressed={dark}
          className={cn('relative shrink-0', className)}
          onClick={() => setTheme(dark ? 'light' : 'dark')}
        >
          <Sun
            className={cn(
              'transition-all duration-300',
              dark ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0',
            )}
          />
          <Moon
            className={cn(
              'absolute transition-all duration-300',
              dark ? 'scale-100 rotate-0' : 'scale-0 rotate-90 opacity-0',
            )}
          />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

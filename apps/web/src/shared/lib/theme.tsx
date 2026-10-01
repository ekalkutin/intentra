import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { z } from 'zod';

import { readStored, writeStored } from './storage';

export const ThemeSchema = z.enum(['system', 'light', 'dark']);

export type Theme = z.infer<typeof ThemeSchema>;

type ResolvedTheme = Exclude<Theme, 'system'>;

type ThemeContextValue = {
  readonly theme: Theme;
  readonly resolvedTheme: ResolvedTheme;
  readonly setTheme: (theme: Theme) => void;
};

/** Also read by the script in `index.html`, before the app renders. */
const STORAGE_KEY = 'intentra.theme';
const ThemeContext = createContext<ThemeContextValue | null>(null);
const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

/** Puts the `dark` class on <html> from the chosen theme or the system's. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() =>
    ThemeSchema.catch(ThemeSchema.enum.system).parse(readStored(STORAGE_KEY)),
  );
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia(DARK_SCHEME_QUERY).matches,
  );

  useEffect(() => {
    const darkScheme = window.matchMedia(DARK_SCHEME_QUERY);
    const onChange = () => setSystemDark(darkScheme.matches);
    darkScheme.addEventListener('change', onChange);
    return () => darkScheme.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme: ResolvedTheme =
    theme === ThemeSchema.enum.system
      ? systemDark
        ? ThemeSchema.enum.dark
        : ThemeSchema.enum.light
      : theme;

  useEffect(() => {
    const dark = resolvedTheme === ThemeSchema.enum.dark;
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next: Theme) => {
        writeStored(STORAGE_KEY, next);
        setThemeState(next);
      },
    }),
    [theme, resolvedTheme],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme needs a ThemeProvider');
  }

  return context;
}

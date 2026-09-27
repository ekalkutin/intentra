import { useSyncExternalStore } from 'react';

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export type Theme = (typeof THEME)[keyof typeof THEME];

const STORAGE_KEY = 'intentra.theme';
const DARK_CLASS = 'dark';
const DARK_QUERY = window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set<() => void>();

const isTheme = (value: unknown): value is Theme =>
  Object.values(THEME).includes(value as Theme);

/** Per device: it lives in this browser, not on the account. */
const readTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : THEME.SYSTEM;
  } catch {
    return THEME.SYSTEM;
  }
};

/** Puts the stored theme on `<html>` and keeps "system" in step with the OS. */
export const applyTheme = () => {
  const theme = readTheme();
  const dark =
    theme === THEME.DARK || (theme === THEME.SYSTEM && DARK_QUERY.matches);
  document.documentElement.classList.toggle(DARK_CLASS, dark);
};

export const setTheme = (theme: Theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage blocked: the choice lasts until reload.
  }
  applyTheme();
  listeners.forEach(listener => listener());
};

DARK_QUERY.addEventListener('change', applyTheme);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useTheme = (): Theme => useSyncExternalStore(subscribe, readTheme);

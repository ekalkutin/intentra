import { useEffect } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';

import { useAppSelector } from '@/app/store';
import { selectLanguage, useDict } from '@/features/language-switch';

/* `landing-light` is the reference's own wrapper: the bands carry hardcoded
 * palettes, so the tree is pinned to the light token set and the landing
 * radius language is scoped here rather than leaking into product UI. */
export function RootLayout() {
  const language = useAppSelector(selectLanguage);
  const t = useDict();
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    document.title = isDashboard
      ? 'Intentra — Overview'
      : `Intentra — ${t.hero.headlineLine1} ${t.hero.headlineLine2}`;
  }, [isDashboard, t]);

  return (
    <div
      className={
        isDashboard
          ? 'min-h-dvh bg-background'
          : 'landing-light min-h-dvh bg-white'
      }
    >
      <Outlet />
      <ScrollRestoration />
    </div>
  );
}

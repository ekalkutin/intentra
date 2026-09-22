import { createBrowserRouter } from 'react-router';

import { SignInPage } from '@/pages/auth/sign-in';
import { SignUpPage } from '@/pages/auth/sign-up';
import { DashboardPage } from '@/pages/dashboard';
import { LandingPage } from '@/pages/landing';
import { NotFoundPage } from '@/pages/not-found';
import { AppShell } from '@/widgets/app-shell';

import { RequireSession } from './guards/require-session';
import { RootLayout } from './root-layout';

/* Library mode, one route tree. The landing and the two auth screens are the
 * public routes; everything under the shell sits behind RequireSession, so a
 * new feature route inherits the guard by being added in the right place. */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: 'auth/sign-in', Component: SignInPage },
      { path: 'auth/sign-up', Component: SignUpPage },
      {
        Component: RequireSession,
        children: [
          {
            path: 'dashboard',
            Component: AppShell,
            children: [
              { index: true, Component: DashboardPage },
              // The shell navigation can grow feature routes incrementally
              // without dropping people back into the public 404 during that
              // work.
              { path: '*', Component: DashboardPage },
            ],
          },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);

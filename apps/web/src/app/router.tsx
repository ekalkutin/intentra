import { createBrowserRouter } from 'react-router';

import { SignInPage } from '@/pages/auth/sign-in';
import { DashboardPage } from '@/pages/dashboard';
import { LandingPage } from '@/pages/landing';
import { NotFoundPage } from '@/pages/not-found';
import { AppShell } from '@/widgets/app-shell';

import { RootLayout } from './root-layout';

/* Library mode, one route tree. The landing is the only public route today;
 * the authenticated shell becomes a sibling branch of this root, not a second
 * router. */
export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: 'auth/sign-in', Component: SignInPage },
      {
        path: 'dashboard',
        Component: AppShell,
        children: [
          { index: true, Component: DashboardPage },
          // The shell navigation can grow feature routes incrementally without
          // dropping people back into the public 404 during that work.
          { path: '*', Component: DashboardPage },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);

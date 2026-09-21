import { createBrowserRouter } from 'react-router';

import { SignInPage } from '@/pages/auth/sign-in';
import { LandingPage } from '@/pages/landing';
import { NotFoundPage } from '@/pages/not-found';

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
      { path: '*', Component: NotFoundPage },
    ],
  },
]);

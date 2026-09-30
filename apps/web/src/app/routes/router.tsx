import { createBrowserRouter, redirect } from 'react-router';

import { SignInPage, SignUpPage } from '@/pages/auth';
import { HomePage } from '@/pages/home';
import { ROUTES } from '@/shared/config';

import { requireNoSession, requireSession } from './guards';
import { SessionRedirects } from './session-redirects';

export const router = createBrowserRouter([
  {
    Component: SessionRedirects,
    children: [
      { path: ROUTES.home, loader: requireSession, Component: HomePage },
      {
        path: ROUTES.auth,
        loader: requireNoSession,
        children: [
          { index: true, loader: () => redirect(ROUTES.signIn) },
          { path: ROUTES.signIn, Component: SignInPage },
          { path: ROUTES.signUp, Component: SignUpPage },
        ],
      },
      { path: '*', loader: () => redirect(ROUTES.home) },
    ],
  },
]);

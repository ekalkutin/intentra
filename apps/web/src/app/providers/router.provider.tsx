import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { OnboardingPage } from '@/pages/onboarding';
import { SignInPage } from '@/pages/sign-in';
import { SignUpPage } from '@/pages/sign-up';
import { ROUTES } from '@/shared/config';
import { AuthLayout } from '@/widgets/auth-layout';

import {
  RedirectAuthenticated,
  RequireSession,
  WorkspaceGate,
} from '../guards';

const router = createBrowserRouter([
  {
    element: <RedirectAuthenticated />,
    children: [
      {
        path: ROUTES.AUTH.ROOT,
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.AUTH.SIGN_IN} replace />,
          },
          { path: ROUTES.AUTH.SIGN_IN, element: <SignInPage /> },
          { path: ROUTES.AUTH.SIGN_UP, element: <SignUpPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireSession />,
    children: [
      {
        element: <WorkspaceGate requireWorkspace />,
        children: [{ path: ROUTES.HOME, element: <HomePage /> }],
      },
      {
        element: <WorkspaceGate requireWorkspace={false} />,
        children: [{ path: ROUTES.ONBOARDING, element: <OnboardingPage /> }],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export const AppRouterProvider = () => <RouterProvider router={router} />;

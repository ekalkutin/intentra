import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { SignInPage } from '@/pages/sign-in';
import { ROUTES } from '@/shared/config';
import { AuthLayout } from '@/widgets/auth-layout';

const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <HomePage /> },
  {
    path: ROUTES.AUTH.ROOT,
    element: <AuthLayout />,
    children: [
      { index: true, element: <Navigate to={ROUTES.AUTH.SIGN_IN} replace /> },
      { path: ROUTES.AUTH.SIGN_IN, element: <SignInPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export const AppRouterProvider = () => <RouterProvider router={router} />;

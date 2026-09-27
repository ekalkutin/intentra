import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { HomePage } from '@/pages/home';
import { NotFoundPage } from '@/pages/not-found';
import { ROUTES } from '@/shared/config';

const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <HomePage /> },
  { path: '*', element: <NotFoundPage /> },
]);

export const AppRouterProvider = () => <RouterProvider router={router} />;

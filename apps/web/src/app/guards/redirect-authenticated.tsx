import { Navigate, Outlet } from 'react-router';

import { ROUTES } from '@/shared/config';
import { readAccessToken } from '@/shared/session';

export const RedirectAuthenticated = () =>
  readAccessToken() ? <Navigate to={ROUTES.HOME} replace /> : <Outlet />;

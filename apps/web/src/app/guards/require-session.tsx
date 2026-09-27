import { Navigate, Outlet } from 'react-router';

import { ROUTES } from '@/shared/config';
import { readAccessToken } from '@/shared/session';

export const RequireSession = () =>
  readAccessToken() ? (
    <Outlet />
  ) : (
    <Navigate to={ROUTES.AUTH.SIGN_IN} replace />
  );

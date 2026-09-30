import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';

import { useHasSession } from '@/entities/session';
import { RETURN_TO_PARAM, ROUTES } from '@/shared/config';
import { safeReturnTo, signInPath } from '@/shared/lib';

/**
 * Follows the session after the page has loaded: signing in (here or in
 * another tab) leaves the sign-in pages for where the person was going;
 * signing out, or a refresh token that expired, leads to the sign-in page,
 * remembering where the person was.
 */
export function SessionRedirects() {
  const signedIn = useHasSession();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  useEffect(() => {
    const onAuthPage = pathname.startsWith(ROUTES.auth);
    if (signedIn && onAuthPage) {
      const returnTo = new URLSearchParams(search).get(RETURN_TO_PARAM);
      void navigate(safeReturnTo(returnTo), { replace: true });
    }
    if (!signedIn && !onAuthPage) {
      void navigate(signInPath(`${pathname}${search}`), { replace: true });
    }
  }, [signedIn, pathname, search, navigate]);

  return <Outlet />;
}

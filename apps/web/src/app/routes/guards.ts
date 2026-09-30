import { redirect, type LoaderFunctionArgs } from 'react-router';

import { hasSession } from '@/entities/session';
import { RETURN_TO_PARAM } from '@/shared/config';
import { safeReturnTo, signInPath } from '@/shared/lib';

/** A page for the signed in: anyone else signs in first, then comes back. */
export function requireSession({
  request,
}: LoaderFunctionArgs): Response | null {
  if (hasSession()) {
    return null;
  }
  const url = new URL(request.url);

  return redirect(signInPath(`${url.pathname}${url.search}`));
}

/** A page for the signed out: the signed in go where they were going. */
export function requireNoSession({
  request,
}: LoaderFunctionArgs): Response | null {
  if (!hasSession()) {
    return null;
  }
  const url = new URL(request.url);

  return redirect(safeReturnTo(url.searchParams.get(RETURN_TO_PARAM)));
}

import { RETURN_TO_PARAM, ROUTES } from '../config';

/** Any origin works: only whether the path stays on it matters. */
const ORIGIN = 'https://intentra.invalid';

/**
 * Where to go after signing in: a relative path of this app, or home.
 * Anything that could lead elsewhere (`//evil.com`, `https://…`, `/\evil.com`)
 * is dropped, so a link cannot send the person off the site.
 */
export function safeReturnTo(value: string | null | undefined): string {
  if (
    !value?.startsWith('/') ||
    value.startsWith('//') ||
    value.startsWith('/\\')
  ) {
    return ROUTES.home;
  }
  try {
    const url = new URL(value, ORIGIN);
    if (url.origin !== ORIGIN) {
      return ROUTES.home;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return ROUTES.home;
  }
}

/** The sign-in page, remembering where the person was going; home needs no reminder. */
export function signInPath(returnTo: string): string {
  const path = safeReturnTo(returnTo);
  if (path === ROUTES.home) {
    return ROUTES.signIn;
  }

  return `${ROUTES.signIn}?${new URLSearchParams({ [RETURN_TO_PARAM]: path })}`;
}

/** The app's paths, in one place. */
export const ROUTES = {
  home: '/',
  auth: '/auth',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
} as const;

/** The query parameter that carries where to go back to after signing in. */
export const RETURN_TO_PARAM = 'returnTo';

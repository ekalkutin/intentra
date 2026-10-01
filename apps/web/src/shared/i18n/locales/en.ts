import type { ru } from './ru';

/** A locale that may leave texts out; i18next falls back to Russian for them. */
type PartialTexts<T> = {
  readonly [K in keyof T]?: T[K] extends string ? string : PartialTexts<T[K]>;
};

/**
 * The interface's English texts. For now only the sign-in and sign-up pages
 * are translated; everything else falls back to Russian.
 */
export const en = {
  brand: 'Intentra',
  fields: {
    email: 'Email',
    password: 'Password',
    repeatPassword: 'Repeat password',
    passwordHint: 'At least 8 characters.',
    passwordsDiffer: 'Passwords do not match',
    personName: 'Name',
  },
  validation: {
    required: 'Fill in this field',
    tooShort_one: 'At least {{count}} character',
    tooShort_other: 'At least {{count}} characters',
    tooLong_one: 'No more than {{count}} character',
    tooLong_other: 'No more than {{count}} characters',
    email: 'Enter an email like name@example.com',
  },
  signIn: {
    title: 'Welcome back',
    description: 'Sign in to your workspaces.',
    submit: 'Sign in',
    noAccount: 'No account?',
    toSignUp: 'Sign up',
  },
  authArtwork: {
    line1: 'Your agents can’t read minds.',
    line2: 'Now they don’t have to.',
  },
  signUp: {
    title: 'Create an account',
    description: 'Living context for your software projects.',
    submit: 'Create account',
    haveAccount: 'Already have an account?',
    signInFailed:
      'Your account is created, but signing in failed. Sign in on the sign-in page',
    toSignIn: 'Sign in',
  },
  theme: {
    switchTo: {
      light: 'Switch to the light theme',
      dark: 'Switch to the dark theme',
    },
  },
  language: {
    switchTo: {
      ru: 'Переключить на русский',
      en: 'Switch to English',
    },
  },
  errors: {
    fallback: 'Something went wrong. Try again',
    INVALID_CREDENTIALS: 'Wrong email or password',
    ACCOUNT_ALREADY_EXISTS: 'An account with this email already exists',
    ACCOUNT_BLOCKED: 'This account is blocked',
    SIGN_UP_CLOSED:
      'Signing up is by invitation only for now: ask a workspace owner to invite this email',
    INVALID_PERSON_NAME: 'Enter a name of up to 100 characters',
    VALIDATION_FAILED: 'Check what you entered',
    UNAUTHENTICATED: 'Sign in again',
    INTERNAL: 'Something broke on the server. Try later',
    NETWORK_ERROR: 'No connection to the server. Check your network',
  },
} as const satisfies PartialTexts<typeof ru>;

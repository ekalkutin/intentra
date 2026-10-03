import { landingEn } from './landing-en';
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
  landing: landingEn,
  kindsOne: {
    feature: 'Feature',
    'business-rule': 'Business rule',
    scenario: 'Scenario',
    requirement: 'Requirement',
    'open-question': 'Open question',
    decision: 'Decision',
    constraint: 'Constraint',
  },
  statuses: {
    draft: 'draft',
    approved: 'approved',
    rejected: 'declined',
    obsolete: 'obsolete',
  },
  knowledge: { needsReview: 'needs review' },
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
  passport: {
    chapters: {
      overview: 'Overview',
      goals: 'Goals',
      users: 'Users',
      capabilities: 'Capabilities and scenarios',
      rules: 'Rules and glossary',
      integrations: 'Integrations',
      qualities: 'Qualities and constraints',
      decisions: 'Decisions and open questions',
    },
    chapterDescriptions: {
      overview:
        'What the product is, which problem it solves, for whom, and what they get.',
      goals: 'What the project wants to achieve and how to tell it has.',
      users: 'Who uses the product and what they need from it.',
      capabilities:
        'What can be done in the product and what result to expect.',
      rules: 'The rules the product works by and the words used for it.',
      integrations: 'Which outside systems the product exchanges data with.',
      qualities: 'What the product must be like and what is set from outside.',
      decisions: 'What is decided and why, and what is not decided yet.',
    },
    discuss: 'Discuss',
    discussLabel: 'Discuss the “{{chapter}}” chapter with the agent',
    // The first message to the agent follows the interface's language.
    discussPrompt:
      "Let's fill in the passport chapter “{{chapter}}”: {{about}} It is empty for now. Ask me one question at a time, suggest answer options, and record what we find out as drafts.",
    discussMorePrompt:
      "Let's add to the passport chapter “{{chapter}}”: {{about}} It already has: {{items}}. Look for what is missing and what contradicts itself, ask me one question at a time, suggest answer options, and record anything new as drafts.",
    discussMore_one: 'and {{count}} more',
    discussMore_other: 'and {{count}} more',
  },
} as const satisfies PartialTexts<typeof ru>;

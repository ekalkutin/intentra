import type { ApiError } from '../api';

/** The part of i18next this needs. */
export type Translator = {
  readonly t: (key: string) => string;
  readonly exists: (key: string) => boolean;
};

export type DescribedError<Field extends string> = {
  /** The form field it concerns, or null for the whole form. */
  readonly field: Field | null;
  readonly text: string;
};

const ERRORS_PREFIX = 'errors';
const FALLBACK_KEY = `${ERRORS_PREFIX}.fallback`;

/**
 * An API error as the person reads it: `errors.<CODE>`, or a general text
 * when there is no translation (the code then goes to the console). A form
 * names the codes that concern one of its fields.
 */
export function describeError<Field extends string>(
  error: ApiError,
  fieldsByCode: Readonly<Partial<Record<string, Field>>>,
  translator: Translator,
): DescribedError<Field> {
  const key = `${ERRORS_PREFIX}.${error.code}`;
  const known = translator.exists(key);
  if (!known) {
    // oxlint-disable-next-line no-console -- a missing text is for developers to see.
    console.warn(`No text for the error ${error.code}: ${error.message}`);
  }

  return {
    field: fieldsByCode[error.code] ?? null,
    text: translator.t(known ? key : FALLBACK_KEY),
  };
}

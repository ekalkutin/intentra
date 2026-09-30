import type { z } from 'zod';

/** The part of i18next this needs: a key, and the values it interpolates. */
export type ValidationTranslator = (
  key:
    | 'validation.required'
    | 'validation.tooShort'
    | 'validation.tooLong'
    | 'validation.email',
  values?: { readonly count: number },
) => string;

/**
 * The text for a failed check, in the product's own words, for the checks
 * the forms meet; undefined leaves the message to zod's locale.
 */
export function validationMessage(
  issue: z.core.$ZodRawIssue,
  t: ValidationTranslator,
): string | undefined {
  if (issue.code === 'too_small' && issue.origin === 'string') {
    const minimum = Number(issue.minimum);
    return minimum <= 1
      ? t('validation.required')
      : t('validation.tooShort', { count: minimum });
  }
  if (issue.code === 'too_big' && issue.origin === 'string') {
    return t('validation.tooLong', { count: Number(issue.maximum) });
  }
  if (issue.code === 'invalid_format' && issue.format === 'email') {
    return t('validation.email');
  }
  return undefined;
}

import type { z } from 'zod';

const REQUIRED = 'This field is required.';

const FORMAT_MESSAGES: Partial<Record<string, string>> = {
  email: 'Enter a valid email address.',
  url: 'Enter a valid URL.',
  uuid: 'Enter a valid identifier.',
};

export const zodErrorMap: z.core.$ZodErrorMap = issue => {
  if (issue.input === '') return REQUIRED;

  switch (issue.code) {
    case 'invalid_type':
      return issue.input === undefined || issue.input === null
        ? REQUIRED
        : undefined;
    case 'invalid_format':
      return FORMAT_MESSAGES[issue.format];
    case 'too_small':
      if (issue.origin !== 'string') return undefined;
      return Number(issue.minimum) <= 1
        ? REQUIRED
        : `Must be at least ${issue.minimum} characters.`;
    case 'too_big':
      return issue.origin === 'string'
        ? `Must be at most ${issue.maximum} characters.`
        : undefined;
    default:
      return undefined;
  }
};

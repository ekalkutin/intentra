import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  validationMessage,
  type ValidationTranslator,
} from './validation-message';

const t: ValidationTranslator = (key, values) =>
  values ? `${key}:${values.count}` : key;

function firstIssue(schema: z.ZodType, value: unknown): z.core.$ZodRawIssue {
  const result = schema.safeParse(value);
  if (result.success) {
    throw new Error('Expected the value to fail');
  }
  return result.error.issues[0] as z.core.$ZodRawIssue;
}

describe('validationMessage', () => {
  it('asks for at least the minimum length', () => {
    // Arrange
    const issue = firstIssue(z.string().min(8), 'short');

    // Act
    const message = validationMessage(issue, t);

    // Assert
    expect(message).toBe('validation.tooShort:8');
  });

  it('asks to fill in a field that must not be empty', () => {
    // Arrange
    const issue = firstIssue(z.string().min(1), '');

    // Act
    const message = validationMessage(issue, t);

    // Assert
    expect(message).toBe('validation.required');
  });

  it('asks for no more than the maximum length', () => {
    // Arrange
    const issue = firstIssue(z.string().max(3), 'toolong');

    // Act
    const message = validationMessage(issue, t);

    // Assert
    expect(message).toBe('validation.tooLong:3');
  });

  it('asks for a valid email', () => {
    // Arrange
    const issue = firstIssue(z.email(), 'not-an-email');

    // Act
    const message = validationMessage(issue, t);

    // Assert
    expect(message).toBe('validation.email');
  });

  it('leaves other checks to the locale', () => {
    // Arrange
    const issue = firstIssue(z.number(), 'text');

    // Act
    const message = validationMessage(issue, t);

    // Assert
    expect(message).toBeUndefined();
  });
});

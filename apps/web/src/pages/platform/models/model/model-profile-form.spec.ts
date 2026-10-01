import { describe, expect, it } from 'vitest';

import {
  EMPTY_MODEL_PROFILE,
  modelProfileFormSchema,
  toSaveModelProfileDto,
} from './model-profile-form';

const VALID = {
  ...EMPTY_MODEL_PROFILE,
  name: 'Default',
  modelId: 'openrouter/anthropic/claude-sonnet-5',
};

describe('modelProfileFormSchema', () => {
  it('takes a model with every setting left to its default', () => {
    // Act
    const result = modelProfileFormSchema.safeParse(VALID);

    // Assert
    expect(result.success).toBe(true);
  });

  it('refuses a temperature above 2', () => {
    // Act
    const result = modelProfileFormSchema.safeParse({
      ...VALID,
      temperature: '2.5',
    });

    // Assert
    expect(result.success).toBe(false);
  });

  it('refuses a fractional answer length', () => {
    // Act
    const result = modelProfileFormSchema.safeParse({
      ...VALID,
      maxOutputTokens: '1.5',
    });

    // Assert
    expect(result.success).toBe(false);
  });

  it('refuses a model not on OpenRouter', () => {
    // Act
    const result = modelProfileFormSchema.safeParse({
      ...VALID,
      modelId: 'anthropic/claude-sonnet-5',
    });

    // Assert
    expect(result.success).toBe(false);
  });
});

describe('toSaveModelProfileDto', () => {
  it('turns empty settings into the model’s defaults and numbers into numbers', () => {
    // Act
    const dto = toSaveModelProfileDto({
      ...VALID,
      temperature: '0.2',
      reasoningEffort: 'high',
    });

    // Assert
    expect(dto).toEqual({
      name: 'Default',
      modelId: 'openrouter/anthropic/claude-sonnet-5',
      temperature: 0.2,
      reasoningEffort: 'high',
      maxOutputTokens: null,
    });
  });
});

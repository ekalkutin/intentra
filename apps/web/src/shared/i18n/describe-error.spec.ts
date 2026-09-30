import { describe, expect, it, vi } from 'vitest';

import { describeError, type Translator } from './describe-error';

const texts: Record<string, string> = {
  'errors.fallback': 'Что-то пошло не так',
  'errors.INVALID_CREDENTIALS': 'Неверный email или пароль',
  'errors.ACCOUNT_ALREADY_EXISTS': 'Аккаунт с этим email уже есть',
};

const translator: Translator = {
  t: key => texts[key] ?? key,
  exists: key => key in texts,
};

describe('describeError', () => {
  it('shows a known code over the form', () => {
    // Act
    const described = describeError(
      { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      {},
      translator,
    );

    // Assert
    expect(described).toEqual({
      field: null,
      text: 'Неверный email или пароль',
    });
  });

  it('shows a code that concerns a field under it', () => {
    // Act
    const described = describeError(
      { code: 'ACCOUNT_ALREADY_EXISTS', message: 'Account already exists' },
      { ACCOUNT_ALREADY_EXISTS: 'email' },
      translator,
    );

    // Assert
    expect(described).toEqual({
      field: 'email',
      text: 'Аккаунт с этим email уже есть',
    });
  });

  it('shows a general text for an unknown code', () => {
    // Arrange
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    // Act
    const described = describeError(
      { code: 'SOMETHING_NEW', message: 'Something new' },
      {},
      translator,
    );

    // Assert
    expect(described).toEqual({ field: null, text: 'Что-то пошло не так' });
  });
});

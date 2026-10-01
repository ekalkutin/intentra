import { describe, expect, it } from 'vitest';

import { InvalidProviderKeyException } from '../exceptions/index.js';

import { ProviderKeySecret } from './provider-key-secret.vo.js';

describe('ProviderKeySecret', () => {
  it('drops the spaces around a pasted key', () => {
    // Act
    const secret = new ProviderKeySecret('  sk-or-v1-0123456789abcdef\n');

    // Assert
    expect(secret.value).toBe('sk-or-v1-0123456789abcdef');
  });

  it.each(['', 'sk-or-v1', 'sk-or-v1 0123456789', 'x'.repeat(257)])(
    'refuses %j',
    value => {
      // Act
      const creating = () => new ProviderKeySecret(value);

      // Assert
      expect(creating).toThrow(InvalidProviderKeyException);
    },
  );

  describe('hint', () => {
    it("keeps an OpenRouter key's prefix and its last four characters", () => {
      // Arrange
      const secret = new ProviderKeySecret('sk-or-v1-0123456789abcdef');

      // Act
      const hint = secret.hint();

      // Assert
      expect(hint.value).toBe('sk-or-v1-…cdef');
    });

    it('shows only three leading characters of a key in another shape', () => {
      // Arrange
      const secret = new ProviderKeySecret('abcdefghijklmnop');

      // Act
      const hint = secret.hint();

      // Assert
      expect(hint.value).toBe('abc…mnop');
    });
  });
});

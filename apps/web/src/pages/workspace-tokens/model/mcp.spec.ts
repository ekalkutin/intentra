import { describe, expect, it } from 'vitest';

import { maskSecret } from './mcp';

describe('maskSecret', () => {
  it('keeps the start and the last two characters of a long secret', () => {
    // Arrange
    const secret = 'intr_ssWdPBLnpl3ZTElJaS83RPYsex7Jot9sOOWCZ85';

    // Act
    const masked = maskSecret(secret);

    // Assert
    expect(masked).toBe('intr_ssW…85');
  });

  it('leaves a short value as it is', () => {
    // Act
    const masked = maskSecret('intr_abc');

    // Assert
    expect(masked).toBe('intr_abc');
  });
});

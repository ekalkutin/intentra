import { describe, expect, it } from 'vitest';

import { PasswordHasherAdapter } from './password-hasher.adapter.js';

describe('PasswordHasherAdapter', () => {
  const hasher = new PasswordHasherAdapter();
  const password = 'correct-horse-battery-staple';

  it('does not store the password as is', async () => {
    // Act
    const hash = await hasher.hash(password);

    // Assert
    expect(hash).not.toContain(password);
  });

  it('accepts the right password and rejects a wrong one', async () => {
    // Arrange
    const hash = await hasher.hash(password);

    // Act
    const [rightMatches, wrongMatches] = await Promise.all([
      hasher.compare(password, hash),
      hasher.compare('wrong-password', hash),
    ]);

    // Assert
    expect(rightMatches).toBe(true);
    expect(wrongMatches).toBe(false);
  });
});

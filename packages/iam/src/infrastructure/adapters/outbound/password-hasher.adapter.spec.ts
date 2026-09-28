import { describe, expect, it } from 'vitest';

import { PasswordHasherAdapter } from './password-hasher.adapter.js';

describe('PasswordHasherAdapter', () => {
  const hasher = new PasswordHasherAdapter();
  const password = 'correct-horse-battery-staple';

  it('does not store the password as is', async () => {
    await expect(hasher.hash(password)).resolves.not.toContain(password);
  });

  it('accepts the right password and rejects a wrong one', async () => {
    const hash = await hasher.hash(password);

    await expect(hasher.compare(password, hash)).resolves.toBe(true);
    await expect(hasher.compare('wrong-password', hash)).resolves.toBe(false);
  });
});

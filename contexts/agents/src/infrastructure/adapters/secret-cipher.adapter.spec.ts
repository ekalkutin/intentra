import { randomBytes } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import type { AgentsModuleOptions } from '../../agents.module-definition.js';

import { SecretCipherAdapter } from './secret-cipher.adapter.js';

const cipherWith = (secretsKey: string) =>
  new SecretCipherAdapter({ secretsKey } as AgentsModuleOptions);

const cipher = cipherWith(randomBytes(32).toString('base64'));

describe('SecretCipherAdapter', () => {
  it('decrypts what it encrypted', () => {
    expect(cipher.decrypt(cipher.encrypt('sk-or-v1-secret'))).toBe(
      'sk-or-v1-secret',
    );
  });

  it('encrypts the same secret differently every time', () => {
    expect(cipher.encrypt('sk-or-v1-secret')).not.toBe(
      cipher.encrypt('sk-or-v1-secret'),
    );
  });

  it('refuses a tampered ciphertext', () => {
    const [iv, tag, ciphertext] = cipher.encrypt('sk-or-v1-secret').split('.');
    const tampered = [iv, tag, `A${ciphertext!.slice(1)}`].join('.');

    expect(() => cipher.decrypt(tampered)).toThrow();
  });

  it('refuses another key', () => {
    const other = cipherWith(randomBytes(32).toString('base64'));

    expect(() => other.decrypt(cipher.encrypt('sk-or-v1-secret'))).toThrow();
  });

  it('requires a 32-byte key', () => {
    expect(() => cipherWith(randomBytes(16).toString('base64'))).toThrow(
      '32 bytes',
    );
  });
});

import { describe, expect, it } from 'vitest';

import {
  EncryptedProviderKey,
  ProviderKeySecret,
} from '../../../domain/value-objects/index.js';
import { DEFAULT_AGENTS_OPTIONS } from '../../runtime/index.js';

import { ProviderKeyCipherAdapter } from './provider-key-cipher.adapter.js';

function cipherWith(byte: number): ProviderKeyCipherAdapter {
  return new ProviderKeyCipherAdapter({
    ...DEFAULT_AGENTS_OPTIONS,
    providerKeyEncryptionKey: Buffer.alloc(32, byte).toString('base64'),
  });
}

const secret = new ProviderKeySecret('sk-or-v1-0123456789abcdef');

describe('ProviderKeyCipherAdapter', () => {
  it('reads back the key it encrypted, never storing it in the clear', () => {
    // Arrange
    const cipher = cipherWith(1);

    // Act
    const encrypted = cipher.encrypt(secret);

    // Assert
    expect(encrypted.value).not.toContain(secret.value);
    expect(cipher.decrypt(encrypted).value).toBe(secret.value);
  });

  it('encrypts the same key differently every time', () => {
    // Arrange
    const cipher = cipherWith(1);

    // Act
    const first = cipher.encrypt(secret);
    const second = cipher.encrypt(secret);

    // Assert
    expect(first.value).not.toBe(second.value);
  });

  it('fails on a changed ciphertext instead of yielding another key', () => {
    // Arrange
    const cipher = cipherWith(1);
    const [version, iv, tag, ciphertext] = cipher
      .encrypt(secret)
      .value.split('.');
    const changed = Buffer.from(ciphertext!, 'base64url');
    changed[0]! ^= 1;
    const tampered = new EncryptedProviderKey(
      [version, iv, tag, changed.toString('base64url')].join('.'),
    );

    // Act
    const decrypting = () => cipher.decrypt(tampered);

    // Assert
    expect(decrypting).toThrow();
  });

  it('cannot read a key encrypted with another secret', () => {
    // Arrange
    const encrypted = cipherWith(1).encrypt(secret);

    // Act
    const decrypting = () => cipherWith(2).decrypt(encrypted);

    // Assert
    expect(decrypting).toThrow();
  });

  it('refuses a secret that is not 32 bytes', () => {
    // Act
    const creating = () =>
      new ProviderKeyCipherAdapter({
        ...DEFAULT_AGENTS_OPTIONS,
        providerKeyEncryptionKey: Buffer.alloc(16).toString('base64'),
      });

    // Assert
    expect(creating).toThrow();
  });
});

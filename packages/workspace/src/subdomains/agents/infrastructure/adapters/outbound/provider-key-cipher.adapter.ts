import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { Inject, Injectable, Provider } from '@nestjs/common';

import { ProviderKeyCipher } from '../../../application/ports/outbound/index.js';
import {
  EncryptedProviderKey,
  ProviderKeySecret,
} from '../../../domain/value-objects/index.js';
import { AGENTS_OPTIONS, type AgentsOptions } from '../../runtime/index.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;
const IV_BYTES = 12;
/** Marks the format, so that another one can be read alongside it later. */
const VERSION = 'v1';
const SEPARATOR = '.';

/**
 * AES-256-GCM with the server's secret: `v1.<iv>.<tag>.<ciphertext>`, each
 * part in base64url. A changed byte fails the decryption instead of yielding
 * another key.
 */
@Injectable()
export class ProviderKeyCipherAdapter extends ProviderKeyCipher {
  readonly #key: Buffer | null;

  constructor(@Inject(AGENTS_OPTIONS) options: AgentsOptions) {
    super();
    this.#key =
      options.providerKeyEncryptionKey === null
        ? null
        : Buffer.from(options.providerKeyEncryptionKey, 'base64');
    if (this.#key && this.#key.length !== KEY_BYTES) {
      throw new Error(
        `The provider key encryption key must be ${KEY_BYTES} bytes in base64`,
      );
    }
  }

  public encrypt(secret: ProviderKeySecret): EncryptedProviderKey {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.requireKey(), iv);
    const ciphertext = Buffer.concat([
      cipher.update(secret.value, 'utf8'),
      cipher.final(),
    ]);

    return new EncryptedProviderKey(
      [VERSION, iv, cipher.getAuthTag(), ciphertext]
        .map(part =>
          typeof part === 'string' ? part : part.toString('base64url'),
        )
        .join(SEPARATOR),
    );
  }

  public decrypt(encrypted: EncryptedProviderKey): ProviderKeySecret {
    const [version, iv, tag, ciphertext] = encrypted.value.split(SEPARATOR);
    if (version !== VERSION || !iv || !tag || !ciphertext) {
      throw new Error('Unknown format of an encrypted provider key');
    }
    const decipher = createDecipheriv(
      ALGORITHM,
      this.requireKey(),
      Buffer.from(iv, 'base64url'),
    );
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));

    return new ProviderKeySecret(
      Buffer.concat([
        decipher.update(Buffer.from(ciphertext, 'base64url')),
        decipher.final(),
      ]).toString('utf8'),
    );
  }

  private requireKey(): Buffer {
    if (!this.#key) {
      throw new Error('The provider key encryption key is not configured');
    }

    return this.#key;
  }
}

export const PROVIDER_KEY_CIPHER_PROVIDER: Provider = {
  provide: ProviderKeyCipher,
  useClass: ProviderKeyCipherAdapter,
};

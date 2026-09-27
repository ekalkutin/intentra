import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import {
  AGENTS_OPTIONS,
  type AgentsModuleOptions,
} from '../../agents.module-definition.js';
import { SecretCipher } from '../../application/ports/index.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;
const IV_BYTES = 12;
const SEPARATOR = '.';

/**
 * AES-256-GCM with a fresh IV per secret. Stored as `iv.tag.ciphertext` in
 * base64url; the tag makes a tampered ciphertext fail instead of decrypting to
 * garbage.
 */
@Injectable()
export class SecretCipherAdapter extends SecretCipher {
  readonly #key: Buffer;

  constructor(@Inject(AGENTS_OPTIONS) options: AgentsModuleOptions) {
    super();
    this.#key = Buffer.from(options.secretsKey, 'base64');
    if (this.#key.length !== KEY_BYTES) {
      throw new Error(`The agents secrets key must be ${KEY_BYTES} bytes`);
    }
  }

  public encrypt(plaintext: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.#key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    return [iv, cipher.getAuthTag(), ciphertext]
      .map(part => part.toString('base64url'))
      .join(SEPARATOR);
  }

  public decrypt(stored: string): string {
    const [iv, tag, ciphertext] = stored
      .split(SEPARATOR)
      .map(part => Buffer.from(part, 'base64url'));
    if (!iv || !tag || !ciphertext) {
      throw new Error('Malformed encrypted secret');
    }
    const decipher = createDecipheriv(ALGORITHM, this.#key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]).toString('utf8');
  }
}

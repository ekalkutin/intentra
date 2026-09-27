import { createHash, randomBytes } from 'node:crypto';

import { Injectable } from '@nestjs/common';

import { PersonalAccessTokenSecrets } from '../../application/ports/index.js';

// Makes a leaked token easy to spot in logs and by secret scanners.
const PREFIX = 'intentra_pat_';
const SECRET_BYTES = 32;

/**
 * The secret is 256 random bits, so a fast SHA-256 is enough: there is nothing
 * to guess, unlike a password. A fast hash also lets it be looked up directly.
 */
@Injectable()
export class PersonalAccessTokenSecretsAdapter extends PersonalAccessTokenSecrets {
  public generate(): string {
    return PREFIX + randomBytes(SECRET_BYTES).toString('base64url');
  }

  public hash(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }
}

import { createHash, randomBytes } from 'node:crypto';

import { Injectable, Provider } from '@nestjs/common';

import {
  PersonalAccessTokenSecrets,
  type IssuedSecret,
} from '../../../application/ports/outbound/index.js';

/** Makes a token recognisable in configs and secret scanners. */
const PREFIX = 'intr_';
const SECRET_BYTES = 32;
/** How many trailing characters the hint shows. */
const HINT_LENGTH = 4;

/**
 * The secret is 256 random bits, so a plain SHA-256 is enough: unlike a
 * password it cannot be guessed, and a fast hash lets it be looked up directly.
 */
@Injectable()
export class PersonalAccessTokenSecretsAdapter extends PersonalAccessTokenSecrets {
  public issue(): IssuedSecret {
    const secret = `${PREFIX}${randomBytes(SECRET_BYTES).toString('base64url')}`;

    return {
      secret,
      hash: this.hash(secret),
      hint: `${PREFIX}…${secret.slice(-HINT_LENGTH)}`,
    };
  }

  public hash(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }
}

export const PERSONAL_ACCESS_TOKEN_SECRETS_PROVIDER: Provider = {
  provide: PersonalAccessTokenSecrets,
  useClass: PersonalAccessTokenSecretsAdapter,
};

import type { AccountId } from '@intentra/shared';

import type { PersonalAccessToken } from '../../domain/entities/index.js';
import type { PersonalAccessTokenId } from '../../domain/value-objects/index.js';
import { PersonalAccessTokenNotFoundException } from '../exceptions/index.js';

export abstract class PersonalAccessTokenRepository {
  abstract save(token: PersonalAccessToken): Promise<void>;
  /** Newest first. */
  abstract findByAccount(accountId: AccountId): Promise<PersonalAccessToken[]>;
  abstract findById(
    accountId: AccountId,
    id: PersonalAccessTokenId,
  ): Promise<PersonalAccessToken | null>;
  abstract findBySecretHash(
    secretHash: string,
  ): Promise<PersonalAccessToken | null>;

  /** Throws `PersonalAccessTokenNotFoundException`, also for another account's. */
  public async getById(
    accountId: AccountId,
    id: PersonalAccessTokenId,
  ): Promise<PersonalAccessToken> {
    const token = await this.findById(accountId, id);
    if (!token) {
      throw new PersonalAccessTokenNotFoundException(id.value);
    }
    return token;
  }
}

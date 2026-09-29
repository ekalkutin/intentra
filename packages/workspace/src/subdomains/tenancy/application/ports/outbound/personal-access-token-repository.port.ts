import type { WorkspaceId } from '@intentra/shared-kernel';

import { PersonalAccessToken } from '../../../domain/entities/index.js';
import type {
  MemberId,
  PersonalAccessTokenId,
  PersonalAccessTokenSecretHash,
} from '../../../domain/value-objects/index.js';
import { PersonalAccessTokenNotFoundException } from '../../exceptions/index.js';

export type PersonalAccessTokenQueryProps = {
  readonly id?: PersonalAccessTokenId;
  readonly workspaceId?: WorkspaceId;
  readonly memberId?: MemberId;
  readonly secretHash?: PersonalAccessTokenSecretHash;
};

/** Exactly one scope, so that a call can never delete every token. */
export type PersonalAccessTokenDeleteProps =
  { readonly workspaceId: WorkspaceId } | { readonly memberId: MemberId };

export abstract class PersonalAccessTokenRepository {
  abstract save(token: PersonalAccessToken): Promise<void>;
  abstract findOne(
    props: PersonalAccessTokenQueryProps,
  ): Promise<PersonalAccessToken | null>;
  abstract findMany(
    props: PersonalAccessTokenQueryProps,
  ): Promise<PersonalAccessToken[]>;
  abstract delete(id: PersonalAccessTokenId): Promise<void>;
  abstract deleteMany(props: PersonalAccessTokenDeleteProps): Promise<void>;

  public async getOne(
    props: PersonalAccessTokenQueryProps,
  ): Promise<PersonalAccessToken> {
    const token = await this.findOne(props);
    if (!token) {
      throw new PersonalAccessTokenNotFoundException();
    }

    return token;
  }
}

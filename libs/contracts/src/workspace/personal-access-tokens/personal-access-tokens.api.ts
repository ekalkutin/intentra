import type { Actor } from '../../iam/index.js';

import type { CreatePersonalAccessTokenDto } from './create-personal-access-token.dto.js';
import type { PersonalAccessTokenCallerDto } from './personal-access-token-caller.dto.js';
import type {
  CreatedPersonalAccessTokenDto,
  PersonalAccessTokenDto,
} from './personal-access-token.dto.js';

export abstract class PersonalAccessTokensApi {
  abstract create(
    actor: Actor,
    workspaceId: string,
    data: CreatePersonalAccessTokenDto,
  ): Promise<CreatedPersonalAccessTokenDto>;

  /** An Owner sees every token in the Workspace, anyone else only their own. */
  abstract list(
    actor: Actor,
    workspaceId: string,
  ): Promise<PersonalAccessTokenDto[]>;

  abstract revoke(
    actor: Actor,
    workspaceId: string,
    tokenId: string,
  ): Promise<void>;

  /** Reads a token's secret, as sent by an external agent. */
  abstract authenticate(secret: string): Promise<PersonalAccessTokenCallerDto>;
}

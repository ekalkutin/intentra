import { Member, PersonalAccessToken, Workspace } from '../entities/index.js';
import { PersonalAccessTokenRevocationForbiddenException } from '../exceptions/index.js';

import { AccessPolicyService } from './access-policy.service.js';

export class PersonalAccessTokenRevocationService {
  readonly #accessPolicyService = new AccessPolicyService();

  /** Its Member or any Owner may revoke a token. */
  public ensureRevocable(
    workspace: Workspace,
    revoker: Member,
    token: PersonalAccessToken,
  ): void {
    revoker.ensureActiveIn(workspace.id);
    if (
      !this.#accessPolicyService.canRevokePersonalAccessToken(revoker, token)
    ) {
      throw new PersonalAccessTokenRevocationForbiddenException();
    }
  }
}

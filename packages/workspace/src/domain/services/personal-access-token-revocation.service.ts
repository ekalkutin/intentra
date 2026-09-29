import { Member, PersonalAccessToken, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  PersonalAccessTokenRevocationForbiddenException,
} from '../exceptions/index.js';

import { AccessPolicyService } from './access-policy.service.js';

export class PersonalAccessTokenRevocationService {
  readonly #accessPolicyService = new AccessPolicyService();

  /** Its Member or any Owner may revoke a token. */
  public ensureRevocable(
    workspace: Workspace,
    revoker: Member,
    token: PersonalAccessToken,
  ): void {
    if (!revoker.belongsTo(workspace.id)) {
      throw new MemberNotInWorkspaceException();
    }
    if (!revoker.isActive()) {
      throw new MemberNotActiveException();
    }
    if (
      !this.#accessPolicyService.canRevokePersonalAccessToken(revoker, token)
    ) {
      throw new PersonalAccessTokenRevocationForbiddenException();
    }
  }
}

import { Member, PersonalAccessToken, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  PersonalAccessTokenRevocationForbiddenException,
} from '../exceptions/index.js';

export class PersonalAccessTokenRevocationService {
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
    if (!revoker.isOwner() && !token.isCreatedBy(revoker.id)) {
      throw new PersonalAccessTokenRevocationForbiddenException();
    }
  }
}

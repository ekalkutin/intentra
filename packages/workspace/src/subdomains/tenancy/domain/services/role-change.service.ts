import { Member, Workspace } from '../entities/index.js';
import {
  LastOwnerCannotStepDownException,
  NotWorkspaceOwnerException,
} from '../exceptions/index.js';
import { Role } from '../value-objects/index.js';

import { AccessPolicyService } from './access-policy.service.js';

export class RoleChangeService {
  readonly #accessPolicyService = new AccessPolicyService();

  /** An Owner gives an Active Member a Role or takes it away, their own included. */
  public change(
    workspace: Workspace,
    changer: Member,
    member: Member,
    props: RoleChangeProps,
  ): void {
    changer.ensureActiveIn(workspace.id);
    if (!this.#accessPolicyService.canManageMembers(changer)) {
      throw new NotWorkspaceOwnerException();
    }
    member.ensureActiveIn(workspace.id);
    if (
      member.isOwner() &&
      !props.role?.equals(Role.Owner) &&
      !props.owners.some(owner => !owner.id.equals(member.id))
    ) {
      throw new LastOwnerCannotStepDownException();
    }
    member.changeRole(props.role);
  }
}

type RoleChangeProps = {
  /** Null takes the Member's Role away. */
  readonly role: Role | null;
  /** The Workspace's Active Owners as they are now. */
  readonly owners: readonly Member[];
};

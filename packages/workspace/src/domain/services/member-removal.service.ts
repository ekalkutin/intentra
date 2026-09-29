import { Member, Workspace } from '../entities/index.js';
import {
  LastOwnerCannotLeaveException,
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
} from '../exceptions/index.js';

import { AccessPolicyService } from './access-policy.service.js';

export class MemberRemovalService {
  readonly #accessPolicyService = new AccessPolicyService();

  /** An Owner removes a Member, another Owner included. */
  public remove(
    workspace: Workspace,
    remover: Member,
    member: Member,
    props: MemberRemovalProps,
  ): void {
    this.ensureActiveIn(workspace, remover);
    if (!this.#accessPolicyService.canManageMembers(remover)) {
      throw new NotWorkspaceOwnerException();
    }
    this.leave(workspace, member, props);
  }

  /** A Member leaves on their own. */
  public leave(
    workspace: Workspace,
    member: Member,
    props: MemberRemovalProps,
  ): void {
    this.ensureActiveIn(workspace, member);
    if (member.isOwner() && !this.hasAnotherOwner(member, props.owners)) {
      throw new LastOwnerCannotLeaveException();
    }
    member.remove();
  }

  private hasAnotherOwner(member: Member, owners: readonly Member[]): boolean {
    return owners.some(owner => !owner.id.equals(member.id));
  }

  private ensureActiveIn(workspace: Workspace, member: Member): void {
    if (!member.belongsTo(workspace.id)) {
      throw new MemberNotInWorkspaceException();
    }
    if (!member.isActive()) {
      throw new MemberNotActiveException();
    }
  }
}

type MemberRemovalProps = {
  /** The Workspace's Active Owners as they are now. */
  readonly owners: readonly Member[];
};

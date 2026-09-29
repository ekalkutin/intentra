import { Member, Workspace } from '../entities/index.js';
import {
  LastOwnerCannotStepDownException,
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
} from '../exceptions/index.js';
import { Role } from '../value-objects/index.js';

export class RoleChangeService {
  /** An Owner gives an Active Member a Role or takes it away, their own included. */
  public change(
    workspace: Workspace,
    changer: Member,
    member: Member,
    props: RoleChangeProps,
  ): void {
    this.ensureActiveIn(workspace, changer);
    if (!changer.isOwner()) {
      throw new NotWorkspaceOwnerException();
    }
    this.ensureActiveIn(workspace, member);
    if (
      member.isOwner() &&
      !props.role?.equals(Role.Owner) &&
      !props.owners.some(owner => !owner.id.equals(member.id))
    ) {
      throw new LastOwnerCannotStepDownException();
    }
    member.changeRole(props.role);
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

type RoleChangeProps = {
  /** Null takes the Member's Role away. */
  readonly role: Role | null;
  /** The Workspace's Active Owners as they are now. */
  readonly owners: readonly Member[];
};

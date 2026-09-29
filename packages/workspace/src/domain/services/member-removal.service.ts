import { Member, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
  OwnerCannotLeaveException,
} from '../exceptions/index.js';

export class MemberRemovalService {
  /** The Owner removes another Member. */
  public remove(workspace: Workspace, owner: Member, member: Member): void {
    this.ensureActiveIn(workspace, owner);
    if (!workspace.isOwnedBy(owner.id)) {
      throw new NotWorkspaceOwnerException();
    }
    this.leave(workspace, member);
  }

  /** A Member leaves on their own. */
  public leave(workspace: Workspace, member: Member): void {
    this.ensureActiveIn(workspace, member);
    if (workspace.isOwnedBy(member.id)) {
      throw new OwnerCannotLeaveException();
    }
    member.remove();
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

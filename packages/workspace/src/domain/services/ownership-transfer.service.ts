import { Member, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
} from '../exceptions/index.js';

export class OwnershipTransferService {
  /** The Owner hands the Workspace to another Active Member and stays as a regular Member. */
  public transfer(workspace: Workspace, owner: Member, newOwner: Member): void {
    this.ensureActiveIn(workspace, owner);
    if (!workspace.isOwnedBy(owner.id)) {
      throw new NotWorkspaceOwnerException();
    }
    this.ensureActiveIn(workspace, newOwner);
    workspace.transferOwnership(newOwner.id);
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

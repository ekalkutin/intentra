import { Member, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
} from '../exceptions/index.js';

export class OwnershipTransferService {
  public transfer(workspace: Workspace, newOwner: Member): void {
    if (!newOwner.belongsTo(workspace.id)) {
      throw new MemberNotInWorkspaceException();
    }
    if (!newOwner.isActive()) {
      throw new MemberNotActiveException();
    }
    workspace.transferOwnership(newOwner.id);
  }
}

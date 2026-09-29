import { Member, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
  WorkspaceSlugMismatchException,
} from '../exceptions/index.js';

/** Deletion cannot be undone: only the Owner, and only after typing the slug. */
export class WorkspaceDeletionService {
  public ensureDeletable(
    workspace: Workspace,
    owner: Member,
    props: WorkspaceDeletionProps,
  ): void {
    if (!owner.belongsTo(workspace.id)) {
      throw new MemberNotInWorkspaceException();
    }
    if (!owner.isActive()) {
      throw new MemberNotActiveException();
    }
    if (!workspace.isOwnedBy(owner.id)) {
      throw new NotWorkspaceOwnerException();
    }
    if (workspace.slug.value !== props.slug) {
      throw new WorkspaceSlugMismatchException();
    }
  }
}

type WorkspaceDeletionProps = {
  /** Typed by the Owner to confirm. */
  readonly slug: string;
};

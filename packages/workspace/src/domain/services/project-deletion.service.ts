import { Member, Project, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
  ProjectSlugMismatchException,
} from '../exceptions/index.js';

/** Deletion cannot be undone: only the Owner, and only after typing the slug. */
export class ProjectDeletionService {
  public ensureDeletable(
    workspace: Workspace,
    owner: Member,
    project: Project,
    props: ProjectDeletionProps,
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
    if (project.slug.value !== props.slug) {
      throw new ProjectSlugMismatchException();
    }
  }
}

type ProjectDeletionProps = {
  /** Typed by the Owner to confirm. */
  readonly slug: string;
};

import { Member, Project, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  ProjectDeletionForbiddenException,
  ProjectSlugMismatchException,
} from '../exceptions/index.js';

/**
 * Deletion cannot be undone: only an Owner, or the Manager who created the
 * Project, and only after typing the slug.
 */
export class ProjectDeletionService {
  public ensureDeletable(
    workspace: Workspace,
    deleter: Member,
    project: Project,
    props: ProjectDeletionProps,
  ): void {
    if (!deleter.belongsTo(workspace.id)) {
      throw new MemberNotInWorkspaceException();
    }
    if (!deleter.isActive()) {
      throw new MemberNotActiveException();
    }
    if (!this.canDelete(deleter, project)) {
      throw new ProjectDeletionForbiddenException();
    }
    if (project.slug.value !== props.slug) {
      throw new ProjectSlugMismatchException();
    }
  }

  private canDelete(deleter: Member, project: Project): boolean {
    return (
      deleter.isOwner() ||
      (deleter.isManager() && project.isCreatedBy(deleter.id))
    );
  }
}

type ProjectDeletionProps = {
  /** Typed by the deleter to confirm. */
  readonly slug: string;
};

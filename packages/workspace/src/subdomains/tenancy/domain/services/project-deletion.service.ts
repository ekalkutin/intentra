import { Member, Project, Workspace } from '../entities/index.js';
import {
  ProjectDeletionForbiddenException,
  ProjectSlugMismatchException,
} from '../exceptions/index.js';

import { AccessPolicyService } from './access-policy.service.js';

/**
 * Deletion cannot be undone: only an Owner, or the Manager who created the
 * Project, and only after typing the slug.
 */
export class ProjectDeletionService {
  readonly #accessPolicyService = new AccessPolicyService();

  public ensureDeletable(
    workspace: Workspace,
    deleter: Member,
    project: Project,
    props: ProjectDeletionProps,
  ): void {
    deleter.ensureActiveIn(workspace.id);
    if (!this.#accessPolicyService.canDeleteProject(deleter, project)) {
      throw new ProjectDeletionForbiddenException();
    }
    if (project.slug.value !== props.slug) {
      throw new ProjectSlugMismatchException();
    }
  }
}

type ProjectDeletionProps = {
  /** Typed by the deleter to confirm. */
  readonly slug: string;
};

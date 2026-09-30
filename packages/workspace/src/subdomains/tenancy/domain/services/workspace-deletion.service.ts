import { Member, Workspace } from '../entities/index.js';
import {
  NotWorkspaceOwnerException,
  WorkspaceSlugMismatchException,
} from '../exceptions/index.js';

import { AccessPolicyService } from './access-policy.service.js';

/** Deletion cannot be undone: only an Owner, and only after typing the slug. */
export class WorkspaceDeletionService {
  readonly #accessPolicyService = new AccessPolicyService();

  public ensureDeletable(
    workspace: Workspace,
    owner: Member,
    props: WorkspaceDeletionProps,
  ): void {
    owner.ensureActiveIn(workspace.id);
    if (!this.#accessPolicyService.canDeleteWorkspace(owner)) {
      throw new NotWorkspaceOwnerException();
    }
    if (workspace.slug.value !== props.slug) {
      throw new WorkspaceSlugMismatchException();
    }
  }
}

type WorkspaceDeletionProps = {
  /** Typed by an Owner to confirm. */
  readonly slug: string;
};

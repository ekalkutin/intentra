import { Member, Workspace } from '../entities/index.js';
import {
  NotWorkspaceOwnerException,
  WorkspaceSlugMismatchException,
} from '../exceptions/index.js';

import { AccessPolicyService } from './access-policy.service.js';

/** Deletion cannot be undone: only an Owner or a Platform Admin, and only after typing the slug. */
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
    this.ensureConfirmed(workspace, props);
  }

  /** A Platform Admin deletes any Workspace, from outside it. */
  public ensureDeletableByPlatformAdmin(
    workspace: Workspace,
    props: WorkspaceDeletionProps,
  ): void {
    this.ensureConfirmed(workspace, props);
  }

  private ensureConfirmed(
    workspace: Workspace,
    props: WorkspaceDeletionProps,
  ): void {
    if (workspace.slug.value !== props.slug) {
      throw new WorkspaceSlugMismatchException();
    }
  }
}

type WorkspaceDeletionProps = {
  /** Typed to confirm. */
  readonly slug: string;
};

import type { Actor } from '../../iam/index.js';

import type { CreateWorkspaceDto } from './create-workspace.dto.js';
import type { DeleteWorkspaceDto } from './delete-workspace.dto.js';
import type { WorkspaceCreationAccessDto } from './workspace-creation-access.dto.js';
import type { WorkspaceDto } from './workspace.dto.js';

export abstract class WorkspacesApi {
  /** While Open Workspace Creation is off, only a Platform Admin may (403 `WORKSPACE_CREATION_CLOSED`). */
  abstract create(
    actor: Actor,
    data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto>;

  abstract list(actor: Actor): Promise<WorkspaceDto[]>;

  /** Whether the person may create a Workspace: Open Workspace Creation is on, or they are a Platform Admin. */
  abstract getCreationAccess(actor: Actor): Promise<WorkspaceCreationAccessDto>;

  abstract delete(
    actor: Actor,
    workspaceId: string,
    data: DeleteWorkspaceDto,
  ): Promise<void>;
}

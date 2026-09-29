import type { Actor } from '../../iam/index.js';

import type { CreateWorkspaceDto } from './create-workspace.dto.js';
import type { DeleteWorkspaceDto } from './delete-workspace.dto.js';
import type { WorkspaceDto } from './workspace.dto.js';

export abstract class WorkspacesApi {
  abstract create(
    actor: Actor,
    data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto>;

  abstract list(actor: Actor): Promise<WorkspaceDto[]>;

  abstract delete(
    actor: Actor,
    workspaceId: string,
    data: DeleteWorkspaceDto,
  ): Promise<void>;
}

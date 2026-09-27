import type { WorkspaceDto } from '@intentra/contracts/workspace';

import type { Workspace } from '../../domain/workspace/workspace.aggregate.js';

export function toWorkspaceDto(workspace: Workspace): WorkspaceDto {
  return {
    id: workspace.id.value,
    name: workspace.name,
  };
}

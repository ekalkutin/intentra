import type { WorkspaceDto } from '@intentra/contracts/workspace';

import { Workspace } from '../../domain/entities/index.js';

export function toWorkspaceDto(workspace: Workspace): WorkspaceDto {
  return {
    id: workspace.id.value,
    name: workspace.name.value,
    slug: workspace.slug.value,
    suspended: workspace.isSuspended,
  };
}

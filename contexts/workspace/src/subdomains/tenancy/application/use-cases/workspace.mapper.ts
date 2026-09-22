import { ProjectDto, WorkspaceDto } from '@intentra/workspace-contracts';

import { Project, Workspace } from '../../domain/entities/index.js';

export function toWorkspaceDto(workspace: Workspace): WorkspaceDto {
  return {
    id: workspace.id.toString(),
    name: workspace.name,
    createdAt: workspace.createdAt.toISOString(),
  };
}

export function toProjectDto(project: Project): ProjectDto {
  return {
    id: project.id.toString(),
    workspaceId: project.workspaceId.toString(),
    name: project.name,
    createdAt: project.createdAt.toISOString(),
  };
}

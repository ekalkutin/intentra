import type { ProjectDto } from '@intentra/contracts/workspace';

import type { Project } from '../domain/project.aggregate.js';

export function toProjectDto(project: Project): ProjectDto {
  return {
    id: project.id.value,
    workspaceId: project.workspaceId.value,
    name: project.name,
    description: project.description,
  };
}

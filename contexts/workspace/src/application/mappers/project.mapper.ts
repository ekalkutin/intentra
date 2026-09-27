import type { ProjectDto } from '@intentra/contracts/workspace';

import type { Project } from '../../domain/entities/project.aggregate.js';

export function toProjectDto(project: Project): ProjectDto {
  return {
    id: project.id.value,
    workspaceId: project.workspaceId.value,
    name: project.name,
    description: project.description,
  };
}

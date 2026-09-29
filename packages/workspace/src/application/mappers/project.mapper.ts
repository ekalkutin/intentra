import type { ProjectDto } from '@intentra/contracts/workspace';

import { Project } from '../../domain/entities/index.js';

export function toProjectDto(project: Project): ProjectDto {
  return {
    id: project.id.value,
    name: project.name.value,
    slug: project.slug.value,
  };
}

import type { Actor } from '../../iam/index.js';

import type { CreateProjectDto } from './create-project.dto.js';
import type { ProjectDto } from './project.dto.js';

export abstract class ProjectsApi {
  abstract create(
    actor: Actor,
    workspaceId: string,
    data: CreateProjectDto,
  ): Promise<ProjectDto>;

  abstract list(actor: Actor, workspaceId: string): Promise<ProjectDto[]>;
}

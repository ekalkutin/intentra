import type { ProjectId, WorkspaceId } from '@intentra/shared';

import type { Project } from '../../domain/entities/index.js';
import { ProjectNotFoundException } from '../exceptions/index.js';

export abstract class ProjectRepository {
  abstract save(project: Project): Promise<void>;
  abstract findById(id: ProjectId): Promise<Project | null>;
  abstract findByWorkspaces(workspaceIds: WorkspaceId[]): Promise<Project[]>;

  public async getById(id: ProjectId): Promise<Project> {
    const project = await this.findById(id);
    if (!project) {
      throw new ProjectNotFoundException(id.value);
    }
    return project;
  }
}

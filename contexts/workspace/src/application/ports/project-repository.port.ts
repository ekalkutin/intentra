import type { WorkspaceId } from '@intentra/shared';

import { Project } from '../../domain/entities/index.js';

export abstract class ProjectRepository {
  abstract findByWorkspaces(workspaceIds: WorkspaceId[]): Promise<Project[]>;
  abstract save(project: Project): Promise<void>;
}

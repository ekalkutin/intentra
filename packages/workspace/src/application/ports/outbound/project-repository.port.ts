import type { WorkspaceId } from '@intentra/shared-kernel';

import { Project } from '../../../domain/entities/index.js';

export type ProjectQueryProps = {
  readonly workspaceId: WorkspaceId;
};

export abstract class ProjectRepository {
  abstract save(project: Project): Promise<void>;
  abstract findMany(props: ProjectQueryProps): Promise<Project[]>;
}

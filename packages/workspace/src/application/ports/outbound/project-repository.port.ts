import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { Project } from '../../../domain/entities/index.js';

export type ProjectQueryProps = {
  readonly workspaceId: WorkspaceId;
  readonly id?: ProjectId;
};

export abstract class ProjectRepository {
  abstract save(project: Project): Promise<void>;
  abstract findOne(props: ProjectQueryProps): Promise<Project | null>;
  abstract findMany(props: ProjectQueryProps): Promise<Project[]>;
  abstract delete(id: ProjectId): Promise<void>;
  abstract deleteMany(props: {
    readonly workspaceId: WorkspaceId;
  }): Promise<void>;
}

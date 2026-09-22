import { Provider } from '@nestjs/common';

import {
  ProjectRepository,
  WorkspaceRepository,
} from '../../domain/repositories/index.js';

import { ProjectRepositoryAdapter } from './project-repository.adapter.js';
import { WorkspaceRepositoryAdapter } from './workspace-repository.adapter.js';

export const TENANCY_PERSISTENCE: Provider[] = [
  { provide: WorkspaceRepository, useClass: WorkspaceRepositoryAdapter },
  { provide: ProjectRepository, useClass: ProjectRepositoryAdapter },
];

import { Provider } from '@nestjs/common';

import { WorkspaceApiPort } from '../ports/index.js';

import { WorkspaceApiService } from './api.service.js';
import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

export { ProjectsService, WorkspaceApiService, WorkspacesService };

export const APPLICATION_SERVICES: Provider[] = [
  WorkspacesService,
  ProjectsService,
  { provide: WorkspaceApiPort, useClass: WorkspaceApiService },
];

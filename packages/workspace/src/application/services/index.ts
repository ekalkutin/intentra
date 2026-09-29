import { Provider } from '@nestjs/common';

import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

export { ProjectsService, WorkspacesService };

export const APPLICATION_SERVICES: Provider[] = [
  WorkspacesService,
  ProjectsService,
];

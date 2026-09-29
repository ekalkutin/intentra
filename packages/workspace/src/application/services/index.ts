import { Provider } from '@nestjs/common';

import { InvitationsService } from './invitations.service.js';
import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

export { InvitationsService, ProjectsService, WorkspacesService };

export const APPLICATION_SERVICES: Provider[] = [
  WorkspacesService,
  ProjectsService,
  InvitationsService,
];

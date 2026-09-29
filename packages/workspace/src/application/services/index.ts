import { Provider } from '@nestjs/common';

import { InvitationsService } from './invitations.service.js';
import { MembersService } from './members.service.js';
import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

export {
  InvitationsService,
  MembersService,
  ProjectsService,
  WorkspacesService,
};

export const APPLICATION_SERVICES: Provider[] = [
  WorkspacesService,
  ProjectsService,
  InvitationsService,
  MembersService,
];

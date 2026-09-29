import type { Type } from '@nestjs/common';

import { InvitationsController } from './invitations.controller.js';
import { MembersController } from './members.controller.js';
import { ProjectRolesController } from './project-roles.controller.js';
import { ProjectsController } from './projects.controller.js';
import { ReceivedInvitationsController } from './received-invitations.controller.js';
import { WorkspacesController } from './workspaces.controller.js';

export const WORKSPACE_CONTROLLERS: Type[] = [
  WorkspacesController,
  ProjectsController,
  ProjectRolesController,
  InvitationsController,
  MembersController,
  ReceivedInvitationsController,
];

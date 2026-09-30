import type { Type } from '@nestjs/common';

import { AccessController } from './access.controller.js';
import { ConversationsController } from './conversations.controller.js';
import { InvitationsController } from './invitations.controller.js';
import { KnowledgeController } from './knowledge.controller.js';
import { MembersController } from './members.controller.js';
import { PersonalAccessTokensController } from './personal-access-tokens.controller.js';
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
  PersonalAccessTokensController,
  ReceivedInvitationsController,
  AccessController,
  KnowledgeController,
  ConversationsController,
];

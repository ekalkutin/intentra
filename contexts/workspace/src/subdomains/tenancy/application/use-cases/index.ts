import { Provider } from '@nestjs/common';

import {
  CreateProjectCommand,
  CreateProjectCommandHandler,
} from './create-project/create-project.command.js';
import {
  CreateWorkspaceCommand,
  CreateWorkspaceCommandHandler,
} from './create-workspace/create-workspace.command.js';
import {
  FindMyWorkspacesQuery,
  FindMyWorkspacesQueryHandler,
} from './find-my-workspaces/find-my-workspaces.query.js';
import {
  FindProjectsQuery,
  FindProjectsQueryHandler,
} from './find-projects/find-projects.query.js';

export {
  CreateProjectCommand,
  CreateWorkspaceCommand,
  FindMyWorkspacesQuery,
  FindProjectsQuery,
};

export const TENANCY_CQRS_HANDLERS: Provider[] = [
  CreateProjectCommandHandler,
  CreateWorkspaceCommandHandler,
  FindMyWorkspacesQueryHandler,
  FindProjectsQueryHandler,
];

import { Provider } from '@nestjs/common';

import {
  CreateWorkspaceCommand,
  CreateWorkspaceCommandHandler,
} from './create-workspace/create-workspace.command.js';
import {
  FindManyWorkspacesQuery,
  FindManyWorkspacesQueryHandler,
} from './find-many-workspaces/find-many-workspaces.query.js';
import {
  GetOneWorkspaceQuery,
  GetOneWorkspaceQueryHandler,
} from './get-one-workspace/get-one-workspace.query.js';
import {
  UpdateWorkspaceCommand,
  UpdateWorkspaceCommandHandler,
} from './update-workspace/update-workspace.command.js';

export {
  CreateWorkspaceCommand,
  FindManyWorkspacesQuery,
  GetOneWorkspaceQuery,
  UpdateWorkspaceCommand,
};

export const WORKSPACES_CQRS_HANDLERS: Provider[] = [
  CreateWorkspaceCommandHandler,
  UpdateWorkspaceCommandHandler,
  GetOneWorkspaceQueryHandler,
  FindManyWorkspacesQueryHandler,
];

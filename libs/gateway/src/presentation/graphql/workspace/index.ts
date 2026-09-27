import { ProjectFieldResolver } from './project.field.resolver.js';
import { ProjectsResolver } from './projects.resolver.js';
import { WorkspaceLoader } from './workspace.loader.js';
import { WorkspacesResolver } from './workspaces.resolver.js';

export { WorkspaceLoader } from './workspace.loader.js';

export const WORKSPACE_GQL_RESOLVERS = [
  WorkspacesResolver,
  ProjectsResolver,
  ProjectFieldResolver,
];

export const WORKSPACE_GQL_LOADERS = [WorkspaceLoader];

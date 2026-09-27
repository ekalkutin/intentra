export { WORKSPACES_QUERY } from './api/workspaces.query';
export type { WorkspacesQuery } from './api/__generated__/workspaces.query.generated';
export { nameToWorkspaceAlias, randomWorkspaceIdentity } from './model/alias';
export {
  CurrentWorkspaceProvider,
  useCurrentWorkspace,
  type Workspace,
} from './model/current-workspace';
export { WorkspaceAvatar } from './ui/workspace-avatar';

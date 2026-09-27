import { createContext, use, type PropsWithChildren } from 'react';

import type { WorkspacesQuery } from '../api/__generated__/workspaces.query.generated';

export type Workspace = WorkspacesQuery['workspaces'][number];

const CurrentWorkspaceContext = createContext<Workspace | null>(null);

/** The workspace named by the URL's alias, for everything inside the app shell. */
export const CurrentWorkspaceProvider = ({
  workspace,
  children,
}: PropsWithChildren<{ workspace: Workspace }>) => (
  <CurrentWorkspaceContext value={workspace}>
    {children}
  </CurrentWorkspaceContext>
);

export const useCurrentWorkspace = (): Workspace => {
  const workspace = use(CurrentWorkspaceContext);
  if (!workspace) {
    throw new Error(
      'useCurrentWorkspace must be used inside a workspace route',
    );
  }
  return workspace;
};

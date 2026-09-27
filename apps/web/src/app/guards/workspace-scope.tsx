import { useQuery } from '@apollo/client/react';
import { Outlet, useParams } from 'react-router';

import {
  CurrentWorkspaceProvider,
  WORKSPACES_QUERY,
} from '@/entities/workspace';
import { NotFoundPage } from '@/pages/not-found';

/** Resolves `:alias` against the account's workspaces; an unknown one is a 404. */
export const WorkspaceScope = () => {
  const { alias } = useParams();
  const { data } = useQuery(WORKSPACES_QUERY);
  const workspace = data?.workspaces.find(item => item.alias === alias);

  if (!workspace) return <NotFoundPage />;
  return (
    <CurrentWorkspaceProvider workspace={workspace}>
      <Outlet />
    </CurrentWorkspaceProvider>
  );
};

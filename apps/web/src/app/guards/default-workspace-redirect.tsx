import { useQuery } from '@apollo/client/react';
import { generatePath, Navigate } from 'react-router';

import { WORKSPACES_QUERY } from '@/entities/workspace';
import { ROUTES } from '@/shared/config';

/** `/` opens the first workspace; `WorkspaceGate` has already made sure there is one. */
export const DefaultWorkspaceRedirect = () => {
  const { data } = useQuery(WORKSPACES_QUERY);
  const workspace = data?.workspaces[0];
  if (!workspace) return null;
  return (
    <Navigate
      to={generatePath(ROUTES.WORKSPACE.ROOT, { alias: workspace.alias })}
      replace
    />
  );
};

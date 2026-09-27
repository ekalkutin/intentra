import { useQuery } from '@apollo/client/react';
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router';

import { WORKSPACES_QUERY } from '@/entities/workspace';
import { useSignOut } from '@/features/sign-out';
import { isUnauthorized } from '@/shared/api';
import { ROUTES } from '@/shared/config';
import { Spinner } from '@/shared/ui/spinner';

type WorkspaceGateProps = {
  /** `true`: the app needs a workspace. `false`: onboarding, which needs none yet. */
  requireWorkspace: boolean;
};

/** Sends an account with no workspace to onboarding, and one with a workspace away from it. */
export const WorkspaceGate = ({ requireWorkspace }: WorkspaceGateProps) => {
  const { data, error } = useQuery(WORKSPACES_QUERY);
  const signOut = useSignOut();
  const expired = isUnauthorized(error);

  useEffect(() => {
    if (expired) void signOut();
  }, [expired, signOut]);

  if (error && !expired) throw error;
  if (!data) {
    return (
      <div className='flex h-svh items-center justify-center'>
        <Spinner className='size-5 text-muted-foreground' />
      </div>
    );
  }

  const hasWorkspace = data.workspaces.length > 0;
  if (requireWorkspace && !hasWorkspace) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }
  if (!requireWorkspace && hasWorkspace) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <Outlet />;
};

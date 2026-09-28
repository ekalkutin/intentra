import { Outlet, useParams } from 'react-router';

import {
  CurrentProjectProvider,
  useWorkspaceProjects,
} from '@/entities/project';
import { useCurrentWorkspace } from '@/entities/workspace';
import { NotFoundPage } from '@/pages/not-found';
import { Spinner } from '@/shared/ui/spinner';

/** Resolves `:projectId` against the workspace's projects; an unknown one is a 404. */
export const ProjectScope = () => {
  const { projectId } = useParams();
  const workspace = useCurrentWorkspace();
  const { projects, loading } = useWorkspaceProjects(workspace.id);
  const project = projects.find(item => item.id === projectId);

  if (loading) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <Spinner className='size-5 text-muted-foreground' />
      </div>
    );
  }
  if (!project) return <NotFoundPage />;
  return (
    <CurrentProjectProvider project={project}>
      <Outlet />
    </CurrentProjectProvider>
  );
};

import { useMemo } from 'react';
import { useParams } from 'react-router';

import {
  useAccessQuery,
  useMembersQuery,
  useProjectsQuery,
  useWorkspacesQuery,
} from '@/api/workspace-api';

/** The Workspace in the URL, what the Member may do there, and its Members by id. */
export function useWorkspace() {
  const { workspaceId = '' } = useParams();
  const workspaces = useWorkspacesQuery();
  const access = useAccessQuery({ workspaceId }, { skip: !workspaceId });
  const members = useMembersQuery({ workspaceId }, { skip: !workspaceId });

  const memberEmail = useMemo(() => {
    const byId = new Map(members.data?.map(m => [m.id, m.email]));
    return (id: string | null | undefined) =>
      id ? (byId.get(id) ?? 'a former member') : '—';
  }, [members.data]);

  return {
    workspaceId,
    workspace: workspaces.data?.find(w => w.id === workspaceId),
    access: access.data,
    accessQuery: access,
    members: members.data ?? [],
    memberEmail,
  };
}

/** The Project in the URL and the Member's rights in it. */
export function useProject() {
  const { workspaceId = '', projectId = '' } = useParams();
  const projects = useProjectsQuery({ workspaceId }, { skip: !workspaceId });
  const { access } = useWorkspace();

  return {
    workspaceId,
    projectId,
    project: projects.data?.find(p => p.id === projectId),
    projectsQuery: projects,
    projectAccess: access?.projects[projectId],
  };
}

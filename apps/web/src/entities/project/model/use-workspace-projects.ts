import { useQuery } from '@apollo/client/react';

import { PROJECTS_QUERY } from '../api/projects.query';

import type { Project } from './current-project';

export const useWorkspaceProjects = (workspaceId: string) => {
  const { data, loading } = useQuery(PROJECTS_QUERY);
  const projects: readonly Project[] =
    data?.projects.filter(project => project.workspaceId === workspaceId) ?? [];

  return { projects, loading: loading && !data };
};

import { useParams } from 'react-router';

import { ROUTE_PARAMS } from '@/shared/config';
import type {
  ProjectAccessDto,
  ProjectDto,
  WorkspaceAccessDto,
} from '@intentra/contracts/workspace';

import { useProjectsQuery } from '../api/project-api';

export type CurrentProject = {
  /** Undefined while loading, and when the slug names no Project of the Workspace. */
  readonly project: ProjectDto | undefined;
  readonly access: ProjectAccessDto | undefined;
  readonly projects: ProjectDto[];
  readonly isLoading: boolean;
  readonly isMissing: boolean;
};

/** The Project named in the address, within the given Workspace. */
export function useCurrentProject(
  workspaceId: string | undefined,
  workspaceAccess: WorkspaceAccessDto | undefined,
): CurrentProject {
  const slug = useParams()[ROUTE_PARAMS.projectSlug];
  const { data: projects = [], isLoading } = useProjectsQuery(
    workspaceId ?? '',
    { skip: !workspaceId },
  );
  const project = projects.find(candidate => candidate.slug === slug);
  const loading = isLoading || !workspaceId;

  return {
    project,
    access: project ? workspaceAccess?.projects[project.id] : undefined,
    projects,
    isLoading: loading,
    isMissing: !loading && !project,
  };
}

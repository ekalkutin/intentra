import { useEffect } from 'react';
import { useParams } from 'react-router';

import { ROUTE_PARAMS } from '@/shared/config';
import type {
  ProjectAccessDto,
  ProjectDto,
  WorkspaceAccessDto,
} from '@intentra/contracts/workspace';

import { useProjectsQuery } from '../api/project-api';

import { readLastProjectSlug, rememberLastProjectSlug } from './last-project';

export type CurrentProject = {
  /** Undefined while loading, and when the slug names no Project of the Workspace. */
  readonly project: ProjectDto | undefined;
  /**
   * The Project the person works in: the one in the address, else the one
   * opened last in this Workspace, else the first. Undefined with no Projects.
   */
  readonly selected: ProjectDto | undefined;
  readonly access: ProjectAccessDto | undefined;
  readonly projects: ProjectDto[];
  readonly isLoading: boolean;
  readonly isMissing: boolean;
};

/** The Project named in the address, within the given Workspace, and the one the person works in. */
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
  const last = workspaceId ? readLastProjectSlug(workspaceId) : null;
  const selected =
    project ??
    projects.find(candidate => candidate.slug === last) ??
    projects[0];

  useEffect(() => {
    if (workspaceId && project) {
      rememberLastProjectSlug(workspaceId, project.slug);
    }
  }, [workspaceId, project]);

  return {
    project,
    selected,
    access: project ? workspaceAccess?.projects[project.id] : undefined,
    projects,
    isLoading: loading,
    isMissing: !loading && !project,
  };
}

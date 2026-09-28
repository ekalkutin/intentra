import { createContext, use, type PropsWithChildren } from 'react';

import type { ProjectsQuery } from '../api/__generated__/projects.query.generated';

export type Project = ProjectsQuery['projects'][number];

const CurrentProjectContext = createContext<Project | null>(null);

/** The project named by the URL's project id, for everything inside a project route. */
export const CurrentProjectProvider = ({
  project,
  children,
}: PropsWithChildren<{ project: Project }>) => (
  <CurrentProjectContext value={project}>{children}</CurrentProjectContext>
);

export const useCurrentProject = (): Project => {
  const project = use(CurrentProjectContext);
  if (!project) {
    throw new Error('useCurrentProject must be used inside a project route');
  }
  return project;
};

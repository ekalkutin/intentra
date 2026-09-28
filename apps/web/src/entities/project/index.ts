export { PROJECTS_QUERY } from './api/projects.query';
export type { ProjectsQuery } from './api/__generated__/projects.query.generated';
export {
  CurrentProjectProvider,
  useCurrentProject,
  type Project,
} from './model/current-project';
export { useWorkspaceProjects } from './model/use-workspace-projects';

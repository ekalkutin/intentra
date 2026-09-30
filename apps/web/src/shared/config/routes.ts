/** The names of the path parameters, as the routes and `useParams` read them. */
export const ROUTE_PARAMS = {
  workspaceSlug: 'workspaceSlug',
  projectSlug: 'projectSlug',
} as const;

const WORKSPACE_BASE = '/w';
const PROJECT_BASE = 'p';

/** The app's paths, in one place. */
export const ROUTES = {
  home: '/',
  auth: '/auth',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  invitations: '/invitations',
  workspace: `${WORKSPACE_BASE}/:${ROUTE_PARAMS.workspaceSlug}`,
  /** Relative to a Workspace's path. */
  project: `${PROJECT_BASE}/:${ROUTE_PARAMS.projectSlug}`,
} as const;

/** The pages of a Workspace, relative to its path; the index is its Projects. */
export const WORKSPACE_PAGES = {
  members: 'members',
  tokens: 'tokens',
  settings: 'settings',
} as const;

export type WorkspacePage =
  (typeof WORKSPACE_PAGES)[keyof typeof WORKSPACE_PAGES];

/** The pages of a Project, relative to its path; the index is its overview. */
export const PROJECT_PAGES = {
  knowledge: 'knowledge',
  interview: 'interview',
  roles: 'roles',
  settings: 'settings',
} as const;

export type ProjectPage = (typeof PROJECT_PAGES)[keyof typeof PROJECT_PAGES];

/** The path of a Workspace, or of one of its pages. */
export function workspacePath(
  workspaceSlug: string,
  page?: WorkspacePage,
): string {
  const base = `${WORKSPACE_BASE}/${encodeURIComponent(workspaceSlug)}`;

  return page ? `${base}/${page}` : base;
}

/** The path of a Project, or of one of its pages. */
export function projectPath(
  workspaceSlug: string,
  projectSlug: string,
  page?: ProjectPage,
): string {
  const base = `${workspacePath(workspaceSlug)}/${PROJECT_BASE}/${encodeURIComponent(projectSlug)}`;

  return page ? `${base}/${page}` : base;
}

/** The query parameter that carries where to go back to after signing in. */
export const RETURN_TO_PARAM = 'returnTo';

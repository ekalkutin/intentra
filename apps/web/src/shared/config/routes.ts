/** The names of the path parameters, as the routes and `useParams` read them. */
export const ROUTE_PARAMS = {
  workspaceSlug: 'workspaceSlug',
  projectSlug: 'projectSlug',
  knowledgeKey: 'knowledgeKey',
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

const EDIT_SEGMENT = 'edit';

/** The pages under a Project's knowledge, relative to it. */
export const KNOWLEDGE_PAGES = {
  new: 'new',
  item: `:${ROUTE_PARAMS.knowledgeKey}`,
  edit: `:${ROUTE_PARAMS.knowledgeKey}/${EDIT_SEGMENT}`,
} as const;

/** The query parameters of the knowledge pages. */
export const KNOWLEDGE_SEARCH_PARAMS = {
  /** Which part of the knowledge the list shows. */
  view: 'view',
  kind: 'kind',
  /** The Knowledge Key a new Draft replaces. */
  supersedes: 'supersedes',
} as const;

/** The path of one Knowledge Item, or of its editing page. */
export function knowledgeItemPath(
  workspaceSlug: string,
  projectSlug: string,
  key: string,
  { edit = false }: { readonly edit?: boolean } = {},
): string {
  const base = `${projectPath(workspaceSlug, projectSlug, PROJECT_PAGES.knowledge)}/${encodeURIComponent(key)}`;

  return edit ? `${base}/${EDIT_SEGMENT}` : base;
}

/** The path of the page that records a new Draft of a Kind, perhaps replacing an Approved item. */
export function newKnowledgeItemPath(
  workspaceSlug: string,
  projectSlug: string,
  kind: string,
  supersedes?: string,
): string {
  const params = new URLSearchParams({ [KNOWLEDGE_SEARCH_PARAMS.kind]: kind });
  if (supersedes) {
    params.set(KNOWLEDGE_SEARCH_PARAMS.supersedes, supersedes);
  }

  return `${projectPath(workspaceSlug, projectSlug, PROJECT_PAGES.knowledge)}/${KNOWLEDGE_PAGES.new}?${params.toString()}`;
}

/** The query parameter that carries where to go back to after signing in. */
export const RETURN_TO_PARAM = 'returnTo';

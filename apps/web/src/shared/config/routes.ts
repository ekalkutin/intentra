/** The names of the path parameters, as the routes and `useParams` read them. */
export const ROUTE_PARAMS = {
  workspaceSlug: 'workspaceSlug',
  projectSlug: 'projectSlug',
  knowledgeKey: 'knowledgeKey',
  agentId: 'agentId',
  conversationId: 'conversationId',
  skillId: 'skillId',
} as const;

const WORKSPACE_BASE = '/w';
const PLATFORM_BASE = '/platform';
const PROJECT_BASE = 'p';

/** The app's paths, in one place. */
export const ROUTES = {
  home: '/',
  auth: '/auth',
  signIn: '/auth/sign-in',
  signUp: '/auth/sign-up',
  invitations: '/invitations',
  workspace: `${WORKSPACE_BASE}/:${ROUTE_PARAMS.workspaceSlug}`,
  /** The Platform Admin's section. */
  platform: PLATFORM_BASE,
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

/** The pages of a Project, relative to its path; the index is its Passport. */
export const PROJECT_PAGES = {
  knowledge: 'knowledge',
  analysis: 'analysis',
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

/** The pages under a Project's interview, relative to it: a Conversation, or none for a new one. */
export const INTERVIEW_PAGES = {
  conversation: `:${ROUTE_PARAMS.conversationId}?`,
} as const;

/** The path of a Project's interview, or of one Conversation in it. */
export function conversationPath(
  workspaceSlug: string,
  projectSlug: string,
  conversationId?: string,
): string {
  const base = projectPath(workspaceSlug, projectSlug, PROJECT_PAGES.interview);

  return conversationId
    ? `${base}/${encodeURIComponent(conversationId)}`
    : base;
}

/**
 * What a link into a new Interview may carry in its location state: a first
 * message, sent at once. State, not the address, so a reload never sends it
 * twice.
 */
export type InterviewOpening = { readonly opening: string };

/** The first message a link brought along, if any. */
export function readInterviewOpening(state: unknown): string | null {
  return typeof state === 'object' &&
    state !== null &&
    'opening' in state &&
    typeof state.opening === 'string' &&
    state.opening.trim() !== ''
    ? state.opening
    : null;
}

/** The query parameters of the knowledge pages. */
export const KNOWLEDGE_SEARCH_PARAMS = {
  /** Which part of the knowledge the list shows. */
  view: 'view',
  kind: 'kind',
  /** Newest first instead of by Knowledge Key. */
  order: 'order',
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

/** The pages of the Platform Admin's section, relative to it. */
export const PLATFORM_PAGES = {
  agents: 'agents',
  skills: 'skills',
  modelProfiles: 'models',
  changes: 'changes',
  settings: 'settings',
} as const;

export type PlatformPage = (typeof PLATFORM_PAGES)[keyof typeof PLATFORM_PAGES];

const NEW_SEGMENT = 'new';

/** The pages under the Agents and the Skills, relative to their list. */
export const PLATFORM_OBJECT_PAGES = {
  new: NEW_SEGMENT,
  agent: `:${ROUTE_PARAMS.agentId}`,
  skill: `:${ROUTE_PARAMS.skillId}`,
} as const;

/** The query parameters of the Platform Admin's pages. */
export const PLATFORM_SEARCH_PARAMS = {
  /** The role of a new Agent. */
  role: 'role',
} as const;

/** The path of a page of the Platform Admin's section. */
export function platformPath(page: PlatformPage): string {
  return `${PLATFORM_BASE}/${page}`;
}

/** The path of one Agent, or of the page creating one with a role. */
export function platformAgentPath(
  agent: { readonly id: string } | { readonly newRole: string },
): string {
  const base = platformPath(PLATFORM_PAGES.agents);
  if ('id' in agent) {
    return `${base}/${encodeURIComponent(agent.id)}`;
  }
  const params = new URLSearchParams({
    [PLATFORM_SEARCH_PARAMS.role]: agent.newRole,
  });

  return `${base}/${NEW_SEGMENT}?${params.toString()}`;
}

/** The path of one Skill, or, with no id, of the page creating one. */
export function platformSkillPath(skillId?: string): string {
  return `${platformPath(PLATFORM_PAGES.skills)}/${skillId ? encodeURIComponent(skillId) : NEW_SEGMENT}`;
}

/** The query parameter that carries where to go back to after signing in. */
export const RETURN_TO_PARAM = 'returnTo';

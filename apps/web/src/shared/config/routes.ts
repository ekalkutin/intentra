export const ROUTES = {
  HOME: '/',
  ONBOARDING: '/onboarding',
  NEW_WORKSPACE: '/workspaces/new',
  AUTH: {
    ROOT: '/auth',
    SIGN_IN: '/auth/sign-in',
    SIGN_UP: '/auth/sign-up',
  },
  /** `:alias` is the workspace's alias; build links with `generatePath`. */
  WORKSPACE: {
    ROOT: '/:alias',
    PROJECTS: '/:alias/projects',
    AGENTS: '/:alias/agents',
    SETTINGS: '/:alias/settings',
  },
} as const;

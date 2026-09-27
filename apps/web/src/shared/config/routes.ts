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
    CHAT: '/:alias/chat',
    /** Each category is its own page; its tabs are nested routes. */
    SETTINGS: {
      ROOT: '/:alias/settings',
      PROFILE: {
        ROOT: '/:alias/settings/profile',
        GENERAL: '/:alias/settings/profile/general',
        SECURITY: '/:alias/settings/profile/security',
        ACCESS_TOKENS: '/:alias/settings/profile/access-tokens',
      },
      WORKSPACE: {
        ROOT: '/:alias/settings/workspace',
        GENERAL: '/:alias/settings/workspace/general',
        MEMBERS: '/:alias/settings/workspace/members',
      },
    },
  },
} as const;

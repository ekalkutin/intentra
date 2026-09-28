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
    /** `:projectId` is the project's id; its sections replace the sidebar's menu. */
    PROJECT: {
      ROOT: '/:alias/projects/:projectId',
      CHAT: '/:alias/projects/:projectId/chat',
      OVERVIEW: '/:alias/projects/:projectId/overview',
      REPOSITORIES: '/:alias/projects/:projectId/repositories',
      SETTINGS: {
        ROOT: '/:alias/projects/:projectId/settings',
        GENERAL: '/:alias/projects/:projectId/settings/general',
        MEMBERS: '/:alias/projects/:projectId/settings/members',
      },
    },
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
        AGENTS: '/:alias/settings/workspace/agents',
      },
    },
  },
} as const;

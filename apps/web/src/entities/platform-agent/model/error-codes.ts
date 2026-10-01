/** The Platform Agents API's error codes the pages treat on their own, beyond showing their text. */
export const PLATFORM_AGENTS_ERROR_CODES = {
  agentNotFound: 'AGENT_NOT_FOUND',
  skillNotFound: 'SKILL_NOT_FOUND',
  skillNameTaken: 'SKILL_NAME_TAKEN',
  notPlatformAdmin: 'NOT_PLATFORM_ADMIN',
} as const;

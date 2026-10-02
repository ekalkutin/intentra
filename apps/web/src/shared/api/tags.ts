/**
 * The kinds of cached data a change makes stale. RTK Query names tags with
 * strings only, so they are named once here and referenced everywhere else.
 */
export const API_TAGS = {
  workspace: 'Workspace',
  access: 'Access',
  project: 'Project',
  projectRole: 'ProjectRole',
  member: 'Member',
  invitation: 'Invitation',
  receivedInvitation: 'ReceivedInvitation',
  personalAccessToken: 'PersonalAccessToken',
  knowledge: 'Knowledge',
  providerKey: 'ProviderKey',
  conversation: 'Conversation',
  analysisRun: 'AnalysisRun',
  /** The Unpublished Agents and what they change: one whole, edited object by object. */
  platformAgents: 'PlatformAgents',
  /** Open Sign-up and Open Workspace Creation, and the verdicts that follow from them. */
  platformSettings: 'PlatformSettings',
} as const;

export const API_TAG_TYPES = Object.values(API_TAGS);

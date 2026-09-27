import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  AgentProfilesQuery,
  AgentProfilesQueryVariables,
} from './__generated__/agent-profiles.query.generated';

export const AGENT_PROFILES_QUERY: TypedDocumentNode<
  AgentProfilesQuery,
  AgentProfilesQueryVariables
> = gql`
  query AgentProfiles($workspaceId: ID!) {
    agentProfiles(workspaceId: $workspaceId) {
      id
      role
      name
      description
      instructions
      model
      tools
    }
  }
`;

import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  AgentProfileOptionsQuery,
  AgentProfileOptionsQueryVariables,
} from './__generated__/agent-profile-options.query.generated';

export const AGENT_PROFILE_OPTIONS_QUERY: TypedDocumentNode<
  AgentProfileOptionsQuery,
  AgentProfileOptionsQueryVariables
> = gql`
  query AgentProfileOptions {
    models {
      id
      name
      contextLength
    }
    agentTools {
      id
      description
    }
  }
`;

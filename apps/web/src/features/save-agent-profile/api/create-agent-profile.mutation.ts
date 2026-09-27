import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  CreateAgentProfileMutation,
  CreateAgentProfileMutationVariables,
} from './__generated__/create-agent-profile.mutation.generated';

export const CREATE_AGENT_PROFILE_MUTATION: TypedDocumentNode<
  CreateAgentProfileMutation,
  CreateAgentProfileMutationVariables
> = gql`
  mutation CreateAgentProfile(
    $workspaceId: ID!
    $input: CreateAgentProfileInput!
  ) {
    createAgentProfile(workspaceId: $workspaceId, input: $input) {
      id
    }
  }
`;

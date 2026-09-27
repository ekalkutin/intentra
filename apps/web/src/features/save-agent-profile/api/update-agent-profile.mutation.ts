import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  UpdateAgentProfileMutation,
  UpdateAgentProfileMutationVariables,
} from './__generated__/update-agent-profile.mutation.generated';

export const UPDATE_AGENT_PROFILE_MUTATION: TypedDocumentNode<
  UpdateAgentProfileMutation,
  UpdateAgentProfileMutationVariables
> = gql`
  mutation UpdateAgentProfile(
    $workspaceId: ID!
    $id: ID!
    $input: UpdateAgentProfileInput!
  ) {
    updateAgentProfile(workspaceId: $workspaceId, id: $id, input: $input) {
      id
      name
      description
      instructions
      model
      tools
    }
  }
`;

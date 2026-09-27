import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  DeleteAgentProfileMutation,
  DeleteAgentProfileMutationVariables,
} from './__generated__/delete-agent-profile.mutation.generated';

export const DELETE_AGENT_PROFILE_MUTATION: TypedDocumentNode<
  DeleteAgentProfileMutation,
  DeleteAgentProfileMutationVariables
> = gql`
  mutation DeleteAgentProfile($workspaceId: ID!, $id: ID!) {
    deleteAgentProfile(workspaceId: $workspaceId, id: $id)
  }
`;

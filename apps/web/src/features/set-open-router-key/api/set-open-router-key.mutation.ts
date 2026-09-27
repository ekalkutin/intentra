import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  SetOpenRouterKeyMutation,
  SetOpenRouterKeyMutationVariables,
} from './__generated__/set-open-router-key.mutation.generated';

export const SET_OPEN_ROUTER_KEY_MUTATION: TypedDocumentNode<
  SetOpenRouterKeyMutation,
  SetOpenRouterKeyMutationVariables
> = gql`
  mutation SetOpenRouterKey($workspaceId: ID!, $input: SetOpenRouterKeyInput!) {
    setOpenRouterKey(workspaceId: $workspaceId, input: $input) {
      hint
      updatedAt
    }
  }
`;

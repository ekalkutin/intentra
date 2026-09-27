import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  RemoveOpenRouterKeyMutation,
  RemoveOpenRouterKeyMutationVariables,
} from './__generated__/remove-open-router-key.mutation.generated';

export const REMOVE_OPEN_ROUTER_KEY_MUTATION: TypedDocumentNode<
  RemoveOpenRouterKeyMutation,
  RemoveOpenRouterKeyMutationVariables
> = gql`
  mutation RemoveOpenRouterKey($workspaceId: ID!) {
    removeOpenRouterKey(workspaceId: $workspaceId)
  }
`;

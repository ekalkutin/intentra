import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  OpenRouterKeyQuery,
  OpenRouterKeyQueryVariables,
} from './__generated__/open-router-key.query.generated';

export const OPEN_ROUTER_KEY_QUERY: TypedDocumentNode<
  OpenRouterKeyQuery,
  OpenRouterKeyQueryVariables
> = gql`
  query OpenRouterKey($workspaceId: ID!) {
    openRouterKey(workspaceId: $workspaceId) {
      hint
      updatedAt
    }
  }
`;

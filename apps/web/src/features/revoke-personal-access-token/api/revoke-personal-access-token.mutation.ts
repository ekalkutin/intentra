import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  RevokePersonalAccessTokenMutation,
  RevokePersonalAccessTokenMutationVariables,
} from './__generated__/revoke-personal-access-token.mutation.generated';

export const REVOKE_PERSONAL_ACCESS_TOKEN_MUTATION: TypedDocumentNode<
  RevokePersonalAccessTokenMutation,
  RevokePersonalAccessTokenMutationVariables
> = gql`
  mutation RevokePersonalAccessToken($id: ID!) {
    revokePersonalAccessToken(id: $id)
  }
`;

import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  CreatePersonalAccessTokenMutation,
  CreatePersonalAccessTokenMutationVariables,
} from './__generated__/create-personal-access-token.mutation.generated';

export const CREATE_PERSONAL_ACCESS_TOKEN_MUTATION: TypedDocumentNode<
  CreatePersonalAccessTokenMutation,
  CreatePersonalAccessTokenMutationVariables
> = gql`
  mutation CreatePersonalAccessToken($input: CreatePersonalAccessTokenInput!) {
    createPersonalAccessToken(input: $input) {
      token
      personalAccessToken {
        id
      }
    }
  }
`;

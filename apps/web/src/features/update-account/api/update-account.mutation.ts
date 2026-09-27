import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  UpdateAccountMutation,
  UpdateAccountMutationVariables,
} from './__generated__/update-account.mutation.generated';

export const UPDATE_ACCOUNT_MUTATION: TypedDocumentNode<
  UpdateAccountMutation,
  UpdateAccountMutationVariables
> = gql`
  mutation UpdateAccount($input: UpdateAccountInput!) {
    updateAccount(input: $input) {
      id
      email
      displayName
    }
  }
`;

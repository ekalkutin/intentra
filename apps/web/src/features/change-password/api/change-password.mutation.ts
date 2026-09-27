import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  ChangePasswordMutation,
  ChangePasswordMutationVariables,
} from './__generated__/change-password.mutation.generated';

export const CHANGE_PASSWORD_MUTATION: TypedDocumentNode<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
> = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

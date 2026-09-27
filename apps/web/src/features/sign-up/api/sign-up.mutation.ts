import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  SignUpMutation,
  SignUpMutationVariables,
} from './__generated__/sign-up.mutation.generated';

export const SIGN_UP_MUTATION: TypedDocumentNode<
  SignUpMutation,
  SignUpMutationVariables
> = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

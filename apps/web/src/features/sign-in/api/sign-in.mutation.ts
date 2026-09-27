import { gql, type TypedDocumentNode } from '@apollo/client';

import type {
  SignInMutation,
  SignInMutationVariables,
} from './__generated__/sign-in.mutation.generated';

export const SIGN_IN_MUTATION: TypedDocumentNode<
  SignInMutation,
  SignInMutationVariables
> = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

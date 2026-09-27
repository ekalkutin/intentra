import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { writeTokens } from '@/shared/session';
import type { SignInDto } from '@intentra/contracts/iam';

import { SIGN_IN_MUTATION } from '../api/sign-in.mutation';

const describeError = (error: unknown): string =>
  CombinedGraphQLErrors.is(error)
    ? (error.errors[0]?.message ?? 'Sign-in failed')
    : 'Could not reach the server. Try again.';

export const useSignIn = () => {
  const [mutate, { loading }] = useMutation(SIGN_IN_MUTATION);

  const signIn = async (input: SignInDto): Promise<string | null> => {
    try {
      const { data } = await mutate({ variables: { input } });
      if (!data) return 'Sign-in failed';
      writeTokens(data.signIn);
      return null;
    } catch (error) {
      return describeError(error);
    }
  };

  return { signIn, loading };
};

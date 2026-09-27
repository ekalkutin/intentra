import { useMutation } from '@apollo/client/react';

import { describeError } from '@/shared/api';
import { writeTokens } from '@/shared/session';
import type { SignInDto } from '@intentra/contracts/iam';

import { SIGN_IN_MUTATION } from '../api/sign-in.mutation';

const FALLBACK_ERROR = 'Sign-in failed';

export const useSignIn = () => {
  const [mutate, { loading }] = useMutation(SIGN_IN_MUTATION);

  const signIn = async (input: SignInDto): Promise<string | null> => {
    try {
      const { data } = await mutate({ variables: { input } });
      if (!data) return FALLBACK_ERROR;
      writeTokens(data.signIn);
      return null;
    } catch (error) {
      return describeError(error, FALLBACK_ERROR);
    }
  };

  return { signIn, loading };
};

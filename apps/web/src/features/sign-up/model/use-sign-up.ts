import { useMutation } from '@apollo/client/react';

import { describeError } from '@/shared/api';
import { writeTokens } from '@/shared/session';
import type { SignUpDto } from '@intentra/contracts/iam';

import { SIGN_UP_MUTATION } from '../api/sign-up.mutation';

const FALLBACK_ERROR = 'Sign-up failed';

export const useSignUp = () => {
  const [mutate, { loading }] = useMutation(SIGN_UP_MUTATION);

  const signUp = async (input: SignUpDto): Promise<string | null> => {
    try {
      const { data } = await mutate({ variables: { input } });
      if (!data) return FALLBACK_ERROR;
      writeTokens(data.signUp);
      return null;
    } catch (error) {
      return describeError(error, FALLBACK_ERROR);
    }
  };

  return { signUp, loading };
};

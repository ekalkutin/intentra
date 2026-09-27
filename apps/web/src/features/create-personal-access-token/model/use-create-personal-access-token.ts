import { useMutation } from '@apollo/client/react';

import { PERSONAL_ACCESS_TOKENS_QUERY } from '@/entities/personal-access-token';
import { describeError } from '@/shared/api';
import type { CreatePersonalAccessTokenDto } from '@intentra/contracts/iam';

import { CREATE_PERSONAL_ACCESS_TOKEN_MUTATION } from '../api/create-personal-access-token.mutation';

const FALLBACK_ERROR = 'Could not create the token';

export const useCreatePersonalAccessToken = () => {
  const [mutate, { loading }] = useMutation(
    CREATE_PERSONAL_ACCESS_TOKEN_MUTATION,
    {
      refetchQueries: [PERSONAL_ACCESS_TOKENS_QUERY],
      awaitRefetchQueries: true,
    },
  );

  /** The secret comes back only here, once. */
  const createToken = async (
    input: CreatePersonalAccessTokenDto,
  ): Promise<
    { secret: string; error?: never } | { secret?: never; error: string }
  > => {
    try {
      const { data } = await mutate({ variables: { input } });
      return data
        ? { secret: data.createPersonalAccessToken.token }
        : { error: FALLBACK_ERROR };
    } catch (error) {
      return { error: describeError(error, FALLBACK_ERROR) };
    }
  };

  return { createToken, loading };
};

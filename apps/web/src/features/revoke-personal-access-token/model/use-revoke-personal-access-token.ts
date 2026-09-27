import { useMutation } from '@apollo/client/react';

import { PERSONAL_ACCESS_TOKENS_QUERY } from '@/entities/personal-access-token';
import { describeError } from '@/shared/api';

import { REVOKE_PERSONAL_ACCESS_TOKEN_MUTATION } from '../api/revoke-personal-access-token.mutation';

const FALLBACK_ERROR = 'Could not revoke the token';

export const useRevokePersonalAccessToken = () => {
  const [mutate, { loading }] = useMutation(
    REVOKE_PERSONAL_ACCESS_TOKEN_MUTATION,
    {
      refetchQueries: [PERSONAL_ACCESS_TOKENS_QUERY],
      awaitRefetchQueries: true,
    },
  );

  const revokeToken = async (id: string): Promise<string | null> => {
    try {
      await mutate({ variables: { id } });
      return null;
    } catch (error) {
      return describeError(error, FALLBACK_ERROR);
    }
  };

  return { revokeToken, loading };
};

import { useMutation } from '@apollo/client/react';

import { describeError } from '@/shared/api';
import type { UpdateAccountDto } from '@intentra/contracts/iam';

import { UPDATE_ACCOUNT_MUTATION } from '../api/update-account.mutation';

const FALLBACK_ERROR = 'Could not save your account';

/** The result lands in the normalized cache, so `me` updates everywhere. */
export const useUpdateAccount = () => {
  const [mutate, { loading }] = useMutation(UPDATE_ACCOUNT_MUTATION);

  const updateAccount = async (
    input: UpdateAccountDto,
  ): Promise<string | null> => {
    try {
      await mutate({ variables: { input } });
      return null;
    } catch (error) {
      return describeError(error, FALLBACK_ERROR);
    }
  };

  return { updateAccount, loading };
};

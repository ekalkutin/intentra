import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { describeError } from '@/shared/api';
import type { ChangePasswordDto } from '@intentra/contracts/iam';

import { CHANGE_PASSWORD_MUTATION } from '../api/change-password.mutation';

const FALLBACK_ERROR = 'Could not change the password';
const WRONG_PASSWORD_CODE = 'WRONG_PASSWORD';

export type ChangePasswordFailure = {
  readonly message: string;
  /** The message goes under the current password field. */
  readonly wrongPassword: boolean;
};

const isWrongPassword = (error: unknown): boolean =>
  CombinedGraphQLErrors.is(error) &&
  error.errors.some(err => err.extensions?.code === WRONG_PASSWORD_CODE);

export const useChangePassword = () => {
  const [mutate, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION);

  const changePassword = async (
    input: ChangePasswordDto,
  ): Promise<ChangePasswordFailure | null> => {
    try {
      await mutate({ variables: { input } });
      return null;
    } catch (error) {
      return {
        message: describeError(error, FALLBACK_ERROR),
        wrongPassword: isWrongPassword(error),
      };
    }
  };

  return { changePassword, loading };
};

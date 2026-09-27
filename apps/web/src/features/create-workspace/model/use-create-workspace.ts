import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { WORKSPACES_QUERY } from '@/entities/workspace';
import { describeError } from '@/shared/api';
import type { CreateWorkspaceDto } from '@intentra/contracts/workspace';

import { CREATE_WORKSPACE_MUTATION } from '../api/create-workspace.mutation';

const FALLBACK_ERROR = 'Could not create the workspace';
const ALIAS_TAKEN_CODE = 'WORKSPACE_ALIAS_ALREADY_TAKEN';

export type CreateWorkspaceFailure = {
  readonly message: string;
  /** The alias belongs to someone else: the message goes under the alias field. */
  readonly aliasTaken: boolean;
};

const isAliasTaken = (error: unknown): boolean =>
  CombinedGraphQLErrors.is(error) &&
  error.errors.some(err => err.extensions?.code === ALIAS_TAKEN_CODE);

export const useCreateWorkspace = () => {
  const [mutate, { loading }] = useMutation(CREATE_WORKSPACE_MUTATION, {
    refetchQueries: [WORKSPACES_QUERY],
    awaitRefetchQueries: true,
  });

  const createWorkspace = async (
    input: CreateWorkspaceDto,
  ): Promise<CreateWorkspaceFailure | null> => {
    try {
      const { data } = await mutate({ variables: { input } });
      return data ? null : { message: FALLBACK_ERROR, aliasTaken: false };
    } catch (error) {
      return {
        message: describeError(error, FALLBACK_ERROR),
        aliasTaken: isAliasTaken(error),
      };
    }
  };

  return { createWorkspace, loading };
};

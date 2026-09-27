import { useMutation } from '@apollo/client/react';

import { describeError } from '@/shared/api';
import type { UpdateWorkspaceDto } from '@intentra/contracts/workspace';

import { UPDATE_WORKSPACE_MUTATION } from '../api/update-workspace.mutation';

const FALLBACK_ERROR = 'Could not rename the workspace';

/** The result lands in the normalized cache: the switcher and crumbs follow. */
export const useRenameWorkspace = () => {
  const [mutate, { loading }] = useMutation(UPDATE_WORKSPACE_MUTATION);

  const renameWorkspace = async (
    id: string,
    input: UpdateWorkspaceDto,
  ): Promise<string | null> => {
    try {
      await mutate({ variables: { id, input } });
      return null;
    } catch (error) {
      return describeError(error, FALLBACK_ERROR);
    }
  };

  return { renameWorkspace, loading };
};

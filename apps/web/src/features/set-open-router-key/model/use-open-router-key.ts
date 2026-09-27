import { useMutation, useQuery } from '@apollo/client/react';

import { describeError } from '@/shared/api';
import type { SetOpenRouterKeyDto } from '@intentra/contracts/agents';

import { OPEN_ROUTER_KEY_QUERY } from '../api/open-router-key.query';
import { REMOVE_OPEN_ROUTER_KEY_MUTATION } from '../api/remove-open-router-key.mutation';
import { SET_OPEN_ROUTER_KEY_MUTATION } from '../api/set-open-router-key.mutation';

const SET_FALLBACK_ERROR = 'Could not save the key';
const REMOVE_FALLBACK_ERROR = 'Could not remove the key';

/** The key itself never comes back: only its last characters and when it was set. */
export const useOpenRouterKey = (workspaceId: string) => {
  const variables = { workspaceId };
  const { data, loading } = useQuery(OPEN_ROUTER_KEY_QUERY, { variables });
  const refetch = {
    refetchQueries: [{ query: OPEN_ROUTER_KEY_QUERY, variables }],
    awaitRefetchQueries: true,
  };
  const [set, { loading: saving }] = useMutation(
    SET_OPEN_ROUTER_KEY_MUTATION,
    refetch,
  );
  const [remove, { loading: removing }] = useMutation(
    REMOVE_OPEN_ROUTER_KEY_MUTATION,
    refetch,
  );

  const setKey = async (input: SetOpenRouterKeyDto): Promise<string | null> => {
    try {
      await set({ variables: { workspaceId, input } });
      return null;
    } catch (error) {
      return describeError(error, SET_FALLBACK_ERROR);
    }
  };

  const removeKey = async (): Promise<string | null> => {
    try {
      await remove({ variables });
      return null;
    } catch (error) {
      return describeError(error, REMOVE_FALLBACK_ERROR);
    }
  };

  return {
    key: data?.openRouterKey ?? null,
    loading: loading && !data,
    setKey,
    removeKey,
    saving,
    removing,
  };
};

import { useMutation } from '@apollo/client/react';

import { AGENT_PROFILES_QUERY } from '@/entities/agent-profile';
import { describeError } from '@/shared/api';

import { DELETE_AGENT_PROFILE_MUTATION } from '../api/delete-agent-profile.mutation';

const FALLBACK_ERROR = 'Could not delete the agent';

export const useDeleteAgentProfile = (workspaceId: string) => {
  const [mutate, { loading }] = useMutation(DELETE_AGENT_PROFILE_MUTATION, {
    refetchQueries: [
      { query: AGENT_PROFILES_QUERY, variables: { workspaceId } },
    ],
    awaitRefetchQueries: true,
  });

  const deleteAgentProfile = async (id: string): Promise<string | null> => {
    try {
      await mutate({ variables: { workspaceId, id } });
      return null;
    } catch (error) {
      return describeError(error, FALLBACK_ERROR);
    }
  };

  return { deleteAgentProfile, loading };
};

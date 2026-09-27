import { useMutation } from '@apollo/client/react';

import { AGENT_PROFILES_QUERY } from '@/entities/agent-profile';
import { describeError } from '@/shared/api';
import type { CreateAgentProfileDto } from '@intentra/contracts/agents';

import { CREATE_AGENT_PROFILE_MUTATION } from '../api/create-agent-profile.mutation';
import { UPDATE_AGENT_PROFILE_MUTATION } from '../api/update-agent-profile.mutation';

const FALLBACK_ERROR = 'Could not save the agent';

/** Creates a specialist, or saves the changes of an existing profile. */
export const useSaveAgentProfile = (workspaceId: string) => {
  const refetch = {
    refetchQueries: [
      { query: AGENT_PROFILES_QUERY, variables: { workspaceId } },
    ],
    awaitRefetchQueries: true,
  };
  const [create, { loading: creating }] = useMutation(
    CREATE_AGENT_PROFILE_MUTATION,
    refetch,
  );
  const [update, { loading: updating }] = useMutation(
    UPDATE_AGENT_PROFILE_MUTATION,
    refetch,
  );

  const saveAgentProfile = async (
    id: string | null,
    input: CreateAgentProfileDto,
  ): Promise<string | null> => {
    try {
      if (id) {
        await update({ variables: { workspaceId, id, input } });
      } else {
        await create({ variables: { workspaceId, input } });
      }
      return null;
    } catch (error) {
      return describeError(error, FALLBACK_ERROR);
    }
  };

  return { saveAgentProfile, loading: creating || updating };
};

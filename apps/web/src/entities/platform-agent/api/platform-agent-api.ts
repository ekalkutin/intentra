import { API_TAGS, baseApi } from '@/shared/api';
import type {
  AgentsChangesDto,
  AgentsVersionSummaryDto,
  AgentToolDto,
  CreateAgentDto,
  ModelProfileDto,
  PlatformAgentDto,
  PublishAgentsDto,
  SaveAgentDto,
  SaveModelProfileDto,
  SaveSkillDto,
  SkillDto,
  UnpublishedAgentsDto,
} from '@intentra/contracts/workspace';

const BASE = '/platform/agents';
const UNPUBLISHED = `${BASE}/unpublished`;
const TAGS = [API_TAGS.platformAgents];

/**
 * Intentra's Agents as a Platform Admin edits them (`/api/platform/agents`):
 * the Unpublished Agents object by object, what they change, and publishing.
 */
export const platformAgentsApi = baseApi.injectEndpoints({
  endpoints: build => ({
    unpublishedAgents: build.query<UnpublishedAgentsDto, void>({
      query: () => UNPUBLISHED,
      providesTags: TAGS,
    }),
    agentsChanges: build.query<AgentsChangesDto, void>({
      query: () => `${UNPUBLISHED}/changes`,
      providesTags: TAGS,
    }),
    agentTools: build.query<AgentToolDto[], void>({
      query: () => `${BASE}/tools`,
    }),
    createAgent: build.mutation<PlatformAgentDto, CreateAgentDto>({
      query: body => ({ url: `${UNPUBLISHED}/agents`, method: 'POST', body }),
      invalidatesTags: TAGS,
    }),
    editAgent: build.mutation<
      PlatformAgentDto,
      { readonly agentId: string; readonly body: SaveAgentDto }
    >({
      query: ({ agentId, body }) => ({
        url: `${UNPUBLISHED}/agents/${agentId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: TAGS,
    }),
    deleteAgent: build.mutation<void, string>({
      query: agentId => ({
        url: `${UNPUBLISHED}/agents/${agentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: TAGS,
    }),
    createSkill: build.mutation<SkillDto, SaveSkillDto>({
      query: body => ({ url: `${UNPUBLISHED}/skills`, method: 'POST', body }),
      invalidatesTags: TAGS,
    }),
    editSkill: build.mutation<
      SkillDto,
      { readonly skillId: string; readonly body: SaveSkillDto }
    >({
      query: ({ skillId, body }) => ({
        url: `${UNPUBLISHED}/skills/${skillId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: TAGS,
    }),
    deleteSkill: build.mutation<void, string>({
      query: skillId => ({
        url: `${UNPUBLISHED}/skills/${skillId}`,
        method: 'DELETE',
      }),
      invalidatesTags: TAGS,
    }),
    createModelProfile: build.mutation<ModelProfileDto, SaveModelProfileDto>({
      query: body => ({
        url: `${UNPUBLISHED}/model-profiles`,
        method: 'POST',
        body,
      }),
      invalidatesTags: TAGS,
    }),
    editModelProfile: build.mutation<
      ModelProfileDto,
      { readonly modelProfileId: string; readonly body: SaveModelProfileDto }
    >({
      query: ({ modelProfileId, body }) => ({
        url: `${UNPUBLISHED}/model-profiles/${modelProfileId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: TAGS,
    }),
    deleteModelProfile: build.mutation<void, string>({
      query: modelProfileId => ({
        url: `${UNPUBLISHED}/model-profiles/${modelProfileId}`,
        method: 'DELETE',
      }),
      invalidatesTags: TAGS,
    }),
    publishAgents: build.mutation<AgentsVersionSummaryDto, PublishAgentsDto>({
      query: body => ({ url: `${BASE}/versions`, method: 'POST', body }),
      invalidatesTags: TAGS,
    }),
  }),
});

export const {
  useUnpublishedAgentsQuery,
  useAgentsChangesQuery,
  useAgentToolsQuery,
  useCreateAgentMutation,
  useEditAgentMutation,
  useDeleteAgentMutation,
  useCreateSkillMutation,
  useEditSkillMutation,
  useDeleteSkillMutation,
  useCreateModelProfileMutation,
  useEditModelProfileMutation,
  useDeleteModelProfileMutation,
  usePublishAgentsMutation,
} = platformAgentsApi;

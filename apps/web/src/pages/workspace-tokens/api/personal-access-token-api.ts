import { API_TAGS, baseApi } from '@/shared/api';
import type {
  CreatedPersonalAccessTokenDto,
  CreatePersonalAccessTokenDto,
  PersonalAccessTokenDto,
} from '@intentra/contracts/workspace';

type InWorkspace = { readonly workspaceId: string };

/** Personal Access Tokens for external agents (`/api/workspaces/:id/personal-access-tokens`). */
export const personalAccessTokenApi = baseApi.injectEndpoints({
  endpoints: build => ({
    personalAccessTokens: build.query<PersonalAccessTokenDto[], string>({
      query: workspaceId => `/workspaces/${workspaceId}/personal-access-tokens`,
      providesTags: [API_TAGS.personalAccessToken],
    }),
    createPersonalAccessToken: build.mutation<
      CreatedPersonalAccessTokenDto,
      InWorkspace & { readonly body: CreatePersonalAccessTokenDto }
    >({
      query: ({ workspaceId, body }) => ({
        url: `/workspaces/${workspaceId}/personal-access-tokens`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.personalAccessToken],
    }),
    revokePersonalAccessToken: build.mutation<
      void,
      InWorkspace & { readonly tokenId: string }
    >({
      query: ({ workspaceId, tokenId }) => ({
        url: `/workspaces/${workspaceId}/personal-access-tokens/${tokenId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.personalAccessToken],
    }),
  }),
});

export const {
  usePersonalAccessTokensQuery,
  useCreatePersonalAccessTokenMutation,
  useRevokePersonalAccessTokenMutation,
} = personalAccessTokenApi;

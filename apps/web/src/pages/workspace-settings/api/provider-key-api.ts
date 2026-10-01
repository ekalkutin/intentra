import { API_TAGS, baseApi } from '@/shared/api';
import type {
  ProviderKeyDto,
  SetProviderKeyDto,
} from '@intentra/contracts/workspace';

const path = (workspaceId: string) => `/workspaces/${workspaceId}/provider-key`;

/** The Workspace's OpenRouter key (`/api/workspaces/:id/provider-key`). */
export const providerKeyApi = baseApi.injectEndpoints({
  endpoints: build => ({
    providerKey: build.query<ProviderKeyDto, string>({
      query: path,
      providesTags: [API_TAGS.providerKey],
    }),
    setProviderKey: build.mutation<
      ProviderKeyDto,
      { readonly workspaceId: string; readonly body: SetProviderKeyDto }
    >({
      query: ({ workspaceId, body }) => ({
        url: path(workspaceId),
        method: 'PUT',
        body,
      }),
      invalidatesTags: [API_TAGS.providerKey],
    }),
    removeProviderKey: build.mutation<void, string>({
      query: workspaceId => ({ url: path(workspaceId), method: 'DELETE' }),
      invalidatesTags: [API_TAGS.providerKey],
    }),
  }),
});

export const {
  useProviderKeyQuery,
  useSetProviderKeyMutation,
  useRemoveProviderKeyMutation,
} = providerKeyApi;

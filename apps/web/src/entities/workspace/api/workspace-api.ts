import { API_TAGS, baseApi } from '@/shared/api';
import type {
  CreateWorkspaceDto,
  DeleteWorkspaceDto,
  WorkspaceAccessDto,
  WorkspaceDto,
} from '@intentra/contracts/workspace';

/** The signed-in person's Workspaces and what they may do in one (`/api/workspaces`). */
export const workspaceApi = baseApi.injectEndpoints({
  endpoints: build => ({
    workspaces: build.query<WorkspaceDto[], void>({
      query: () => '/workspaces',
      providesTags: [API_TAGS.workspace],
    }),
    createWorkspace: build.mutation<WorkspaceDto, CreateWorkspaceDto>({
      query: body => ({ url: '/workspaces', method: 'POST', body }),
      invalidatesTags: [API_TAGS.workspace],
    }),
    deleteWorkspace: build.mutation<
      void,
      { readonly workspaceId: string; readonly body: DeleteWorkspaceDto }
    >({
      query: ({ workspaceId, body }) => ({
        url: `/workspaces/${workspaceId}`,
        method: 'DELETE',
        body,
      }),
      invalidatesTags: [API_TAGS.workspace],
    }),
    workspaceAccess: build.query<WorkspaceAccessDto, string>({
      query: workspaceId => `/workspaces/${workspaceId}/access`,
      providesTags: [API_TAGS.access],
    }),
  }),
});

export const {
  useWorkspacesQuery,
  useLazyWorkspacesQuery,
  useCreateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useWorkspaceAccessQuery,
} = workspaceApi;

import { API_TAGS, baseApi } from '@/shared/api';
import type {
  ChangeProjectRoleDto,
  CreateProjectDto,
  DeleteProjectDto,
  MemberProjectRoleDto,
  ProjectDto,
} from '@intentra/contracts/workspace';

type InWorkspace = { readonly workspaceId: string };
type InProject = InWorkspace & { readonly projectId: string };

/** A Workspace's Projects and their Project Roles (`/api/workspaces/:id/projects`). */
export const projectApi = baseApi.injectEndpoints({
  endpoints: build => ({
    projects: build.query<ProjectDto[], string>({
      query: workspaceId => `/workspaces/${workspaceId}/projects`,
      providesTags: [API_TAGS.project],
    }),
    createProject: build.mutation<
      ProjectDto,
      InWorkspace & { readonly body: CreateProjectDto }
    >({
      query: ({ workspaceId, body }) => ({
        url: `/workspaces/${workspaceId}/projects`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.project, API_TAGS.access],
    }),
    deleteProject: build.mutation<
      void,
      InProject & { readonly body: DeleteProjectDto }
    >({
      query: ({ workspaceId, projectId, body }) => ({
        url: `/workspaces/${workspaceId}/projects/${projectId}`,
        method: 'DELETE',
        body,
      }),
      invalidatesTags: [API_TAGS.project, API_TAGS.access],
    }),
    projectRoles: build.query<MemberProjectRoleDto[], InProject>({
      query: ({ workspaceId, projectId }) =>
        `/workspaces/${workspaceId}/projects/${projectId}/roles`,
      providesTags: [API_TAGS.projectRole],
    }),
    changeProjectRole: build.mutation<
      MemberProjectRoleDto,
      InProject & {
        readonly memberId: string;
        readonly body: ChangeProjectRoleDto;
      }
    >({
      query: ({ workspaceId, projectId, memberId, body }) => ({
        url: `/workspaces/${workspaceId}/projects/${projectId}/roles/${memberId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [API_TAGS.projectRole, API_TAGS.access],
    }),
  }),
});

export const {
  useProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useProjectRolesQuery,
  useChangeProjectRoleMutation,
} = projectApi;

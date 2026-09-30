import type {
  ChangeProjectRoleDto,
  ChangeRoleDto,
  CreatedPersonalAccessTokenDto,
  CreateInvitationDto,
  CreatePersonalAccessTokenDto,
  CreateProjectDto,
  CreateWorkspaceDto,
  InvitationDto,
  MemberDto,
  MemberProjectRoleDto,
  PersonalAccessTokenDto,
  ProjectDto,
  WorkspaceAccessDto,
  WorkspaceDto,
} from '@intentra/contracts/workspace';

import { baseApi } from './base-api';

type InWorkspace = { workspaceId: string };
type InProject = InWorkspace & { projectId: string };

const ws = (workspaceId: string) => `/workspaces/${workspaceId}`;

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: build => ({
    // Workspaces
    workspaces: build.query<WorkspaceDto[], void>({
      query: () => '/workspaces',
      providesTags: ['Workspace'],
    }),
    createWorkspace: build.mutation<WorkspaceDto, CreateWorkspaceDto>({
      query: body => ({ url: '/workspaces', method: 'POST', body }),
      invalidatesTags: ['Workspace'],
    }),
    deleteWorkspace: build.mutation<void, InWorkspace & { slug: string }>({
      query: ({ workspaceId, slug }) => ({
        url: ws(workspaceId),
        method: 'DELETE',
        body: { slug },
      }),
      invalidatesTags: ['Workspace'],
    }),
    access: build.query<WorkspaceAccessDto, InWorkspace>({
      query: ({ workspaceId }) => `${ws(workspaceId)}/access`,
      providesTags: ['Access'],
    }),

    // Members
    members: build.query<MemberDto[], InWorkspace>({
      query: ({ workspaceId }) => `${ws(workspaceId)}/members`,
      providesTags: ['Member'],
    }),
    changeMemberRole: build.mutation<
      MemberDto,
      InWorkspace & { memberId: string } & ChangeRoleDto
    >({
      query: ({ workspaceId, memberId, role }) => ({
        url: `${ws(workspaceId)}/members/${memberId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['Member', 'Access', 'ProjectRole', 'Knowledge'],
    }),
    removeMember: build.mutation<void, InWorkspace & { memberId: string }>({
      query: ({ workspaceId, memberId }) => ({
        url: `${ws(workspaceId)}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Member', 'ProjectRole', 'Token'],
    }),
    leaveWorkspace: build.mutation<void, InWorkspace>({
      query: ({ workspaceId }) => ({
        url: `${ws(workspaceId)}/leave`,
        method: 'POST',
      }),
      invalidatesTags: ['Workspace'],
    }),

    // Invitations the Workspace has sent
    invitations: build.query<InvitationDto[], InWorkspace>({
      query: ({ workspaceId }) => `${ws(workspaceId)}/invitations`,
      providesTags: ['Invitation'],
    }),
    invite: build.mutation<InvitationDto, InWorkspace & CreateInvitationDto>({
      query: ({ workspaceId, email }) => ({
        url: `${ws(workspaceId)}/invitations`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Invitation'],
    }),
    revokeInvitation: build.mutation<
      InvitationDto,
      InWorkspace & { invitationId: string }
    >({
      query: ({ workspaceId, invitationId }) => ({
        url: `${ws(workspaceId)}/invitations/${invitationId}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: ['Invitation'],
    }),

    // Invitations the signed-in Account has received
    receivedInvitations: build.query<InvitationDto[], void>({
      query: () => '/invitations',
      providesTags: ['ReceivedInvitation'],
    }),
    acceptInvitation: build.mutation<InvitationDto, string>({
      query: invitationId => ({
        url: `/invitations/${invitationId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['ReceivedInvitation', 'Workspace'],
    }),
    declineInvitation: build.mutation<InvitationDto, string>({
      query: invitationId => ({
        url: `/invitations/${invitationId}/decline`,
        method: 'POST',
      }),
      invalidatesTags: ['ReceivedInvitation'],
    }),

    // Projects
    projects: build.query<ProjectDto[], InWorkspace>({
      query: ({ workspaceId }) => `${ws(workspaceId)}/projects`,
      providesTags: ['Project'],
    }),
    createProject: build.mutation<ProjectDto, InWorkspace & CreateProjectDto>({
      query: ({ workspaceId, ...body }) => ({
        url: `${ws(workspaceId)}/projects`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Project', 'Access'],
    }),
    deleteProject: build.mutation<void, InProject & { slug: string }>({
      query: ({ workspaceId, projectId, slug }) => ({
        url: `${ws(workspaceId)}/projects/${projectId}`,
        method: 'DELETE',
        body: { slug },
      }),
      invalidatesTags: ['Project', 'Access'],
    }),

    // Project Roles
    projectRoles: build.query<MemberProjectRoleDto[], InProject>({
      query: ({ workspaceId, projectId }) =>
        `${ws(workspaceId)}/projects/${projectId}/roles`,
      providesTags: ['ProjectRole'],
    }),
    changeProjectRole: build.mutation<
      MemberProjectRoleDto,
      InProject & { memberId: string } & ChangeProjectRoleDto
    >({
      query: ({ workspaceId, projectId, memberId, role }) => ({
        url: `${ws(workspaceId)}/projects/${projectId}/roles/${memberId}`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['ProjectRole', 'Access', 'Knowledge'],
    }),

    // Personal Access Tokens
    tokens: build.query<PersonalAccessTokenDto[], InWorkspace>({
      query: ({ workspaceId }) => `${ws(workspaceId)}/personal-access-tokens`,
      providesTags: ['Token'],
    }),
    createToken: build.mutation<
      CreatedPersonalAccessTokenDto,
      InWorkspace & CreatePersonalAccessTokenDto
    >({
      query: ({ workspaceId, ...body }) => ({
        url: `${ws(workspaceId)}/personal-access-tokens`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Token'],
    }),
    revokeToken: build.mutation<void, InWorkspace & { tokenId: string }>({
      query: ({ workspaceId, tokenId }) => ({
        url: `${ws(workspaceId)}/personal-access-tokens/${tokenId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Token'],
    }),
  }),
});

export const {
  useWorkspacesQuery,
  useCreateWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useAccessQuery,
  useMembersQuery,
  useChangeMemberRoleMutation,
  useRemoveMemberMutation,
  useLeaveWorkspaceMutation,
  useInvitationsQuery,
  useInviteMutation,
  useRevokeInvitationMutation,
  useReceivedInvitationsQuery,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useProjectRolesQuery,
  useChangeProjectRoleMutation,
  useTokensQuery,
  useCreateTokenMutation,
  useRevokeTokenMutation,
} = workspaceApi;

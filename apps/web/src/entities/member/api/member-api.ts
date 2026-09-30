import { API_TAGS, baseApi } from '@/shared/api';
import type { ChangeRoleDto, MemberDto } from '@intentra/contracts/workspace';

type InWorkspace = { readonly workspaceId: string };

/** A Workspace's Members and their Roles (`/api/workspaces/:id/members`). */
export const memberApi = baseApi.injectEndpoints({
  endpoints: build => ({
    members: build.query<MemberDto[], string>({
      query: workspaceId => `/workspaces/${workspaceId}/members`,
      providesTags: [API_TAGS.member],
    }),
    changeMemberRole: build.mutation<
      MemberDto,
      InWorkspace & { readonly memberId: string; readonly body: ChangeRoleDto }
    >({
      query: ({ workspaceId, memberId, body }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}/role`,
        method: 'PUT',
        body,
      }),
      // An Owner is Maintainer in every Project, so Project Roles change too.
      invalidatesTags: [API_TAGS.member, API_TAGS.access, API_TAGS.projectRole],
    }),
    removeMember: build.mutation<
      void,
      InWorkspace & { readonly memberId: string }
    >({
      query: ({ workspaceId, memberId }) => ({
        url: `/workspaces/${workspaceId}/members/${memberId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        API_TAGS.member,
        API_TAGS.projectRole,
        API_TAGS.personalAccessToken,
      ],
    }),
    leaveWorkspace: build.mutation<void, string>({
      query: workspaceId => ({
        url: `/workspaces/${workspaceId}/leave`,
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.workspace],
    }),
  }),
});

export const {
  useMembersQuery,
  useChangeMemberRoleMutation,
  useRemoveMemberMutation,
  useLeaveWorkspaceMutation,
} = memberApi;

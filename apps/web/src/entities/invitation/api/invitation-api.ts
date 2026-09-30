import { API_TAGS, baseApi } from '@/shared/api';
import type {
  CreateInvitationDto,
  InvitationDto,
} from '@intentra/contracts/workspace';

type InWorkspace = { readonly workspaceId: string };

/**
 * Invitations a Workspace sends (`/api/workspaces/:id/invitations`) and the
 * ones the signed-in person received (`/api/invitations`).
 */
export const invitationApi = baseApi.injectEndpoints({
  endpoints: build => ({
    invitations: build.query<InvitationDto[], string>({
      query: workspaceId => `/workspaces/${workspaceId}/invitations`,
      providesTags: [API_TAGS.invitation],
    }),
    invite: build.mutation<
      InvitationDto,
      InWorkspace & { readonly body: CreateInvitationDto }
    >({
      query: ({ workspaceId, body }) => ({
        url: `/workspaces/${workspaceId}/invitations`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.invitation],
    }),
    revokeInvitation: build.mutation<
      InvitationDto,
      InWorkspace & { readonly invitationId: string }
    >({
      query: ({ workspaceId, invitationId }) => ({
        url: `/workspaces/${workspaceId}/invitations/${invitationId}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.invitation],
    }),
    receivedInvitations: build.query<InvitationDto[], void>({
      query: () => '/invitations',
      providesTags: [API_TAGS.receivedInvitation],
    }),
    acceptInvitation: build.mutation<InvitationDto, string>({
      query: invitationId => ({
        url: `/invitations/${invitationId}/accept`,
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.receivedInvitation, API_TAGS.workspace],
    }),
    declineInvitation: build.mutation<InvitationDto, string>({
      query: invitationId => ({
        url: `/invitations/${invitationId}/decline`,
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.receivedInvitation],
    }),
  }),
});

export const {
  useInvitationsQuery,
  useInviteMutation,
  useRevokeInvitationMutation,
  useReceivedInvitationsQuery,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
} = invitationApi;

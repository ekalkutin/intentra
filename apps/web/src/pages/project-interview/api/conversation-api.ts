import { API_PREFIX, API_TAGS, baseApi } from '@/shared/api';
import type {
  ConversationDto,
  ConversationPageDto,
  ConversationWithMessagesDto,
  EditConversationDto,
} from '@intentra/contracts/workspace';

/** A Project, as every Conversation request names it. */
export type InProject = {
  readonly workspaceId: string;
  readonly projectId: string;
};

type OneConversation = InProject & { readonly conversationId: string };

const base = ({ workspaceId, projectId }: InProject) =>
  `/workspaces/${workspaceId}/projects/${projectId}/conversations`;

/** Where a message is sent; its answer streams back, outside RTK Query. */
export function messagesUrl(conversation: OneConversation): string {
  return `${API_PREFIX}${base(conversation)}/${conversation.conversationId}/messages`;
}

/** The Member's own Conversations in a Project (`…/projects/:id/conversations`). */
export const conversationApi = baseApi.injectEndpoints({
  endpoints: build => ({
    conversations: build.query<
      ConversationPageDto,
      InProject & { readonly hidden: boolean }
    >({
      query: ({ hidden, ...scope }) => ({
        url: base(scope),
        params: { hidden, take: 200 },
      }),
      providesTags: [API_TAGS.conversation],
    }),
    conversation: build.query<ConversationWithMessagesDto, OneConversation>({
      query: ({ conversationId, ...scope }) =>
        `${base(scope)}/${conversationId}`,
    }),
    editConversation: build.mutation<
      ConversationDto,
      OneConversation & { readonly body: EditConversationDto }
    >({
      query: ({ conversationId, body, ...scope }) => ({
        url: `${base(scope)}/${conversationId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.conversation],
    }),
    deleteConversation: build.mutation<void, OneConversation>({
      query: ({ conversationId, ...scope }) => ({
        url: `${base(scope)}/${conversationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.conversation],
    }),
  }),
});

export const {
  useConversationsQuery,
  useConversationQuery,
  useEditConversationMutation,
  useDeleteConversationMutation,
} = conversationApi;

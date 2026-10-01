import type { UIMessageChunk } from 'ai';

import type { Actor } from '../../iam/index.js';

import type {
  ConversationDto,
  ConversationPageDto,
  ConversationWithMessagesDto,
} from './conversation.dto.js';
import type { EditConversationDto } from './edit-conversation.dto.js';
import type { ListConversationsDto } from './list-conversations.dto.js';
import type { SendMessageDto } from './send-message.dto.js';

/**
 * A Member's Conversations with the Orchestrator in a Project. Only the
 * Member whose Conversation it is reaches it; to anyone else it does not exist
 * (404 `CONVERSATION_NOT_FOUND`). While the Orchestrator answers in a
 * Conversation (its title included), nothing else may change it: another
 * message, an edit or a deletion is refused (409 `CONVERSATION_BUSY`).
 */
export abstract class ConversationsApi {
  /** The Member's own Conversations, shown or hidden ones. */
  abstract list(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    query: ListConversationsDto,
  ): Promise<ConversationPageDto>;

  abstract get(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
  ): Promise<ConversationWithMessagesDto>;

  /** Renames it, hides it or shows it again. */
  abstract edit(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
    data: EditConversationDto,
  ): Promise<ConversationDto>;

  /** Deletes it with its messages; what the Orchestrator recorded stays. */
  abstract delete(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
  ): Promise<void>;

  /**
   * Sends the Member's message and streams the Orchestrator's answer as AI
   * SDK UI message chunks, the first one (`AGENTS_IN_USE_CHUNK_TYPE`,
   * transient) telling which Agents make it: the Published Agents, or in a
   * Platform Admin's own Conversation the Unpublished Agents. The client chooses the id of a new Conversation
   * (a UUID); its first message creates it, and a message to a hidden one
   * shows it again. The answer runs to the end even if nobody reads the
   * stream. Refused while an answer in the Conversation
   * is still running (409 `CONVERSATION_BUSY`), while the Workspace has
   * no Provider Key (412 `PROVIDER_KEY_MISSING`), while no Agents are
   * published (412 `AGENTS_NOT_PUBLISHED`), and for a Platform Admin while
   * the Unpublished Agents could not be published (409
   * `AGENTS_NOT_PUBLISHABLE`).
   */
  abstract send(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
    data: SendMessageDto,
  ): Promise<ReadableStream<UIMessageChunk>>;
}

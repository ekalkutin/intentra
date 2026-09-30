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
   * SDK UI message chunks. The client chooses the id of a new Conversation
   * (a UUID); its first message creates it, and a message to a hidden one
   * shows it again. The answer runs to the end even if nobody reads the
   * stream. Refused while an answer in the Conversation
   * is still running (409 `CONVERSATION_BUSY`) and when the server has no
   * model for its Agents (503 `AGENT_NOT_CONFIGURED`).
   */
  abstract send(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
    data: SendMessageDto,
  ): Promise<ReadableStream<UIMessageChunk>>;
}

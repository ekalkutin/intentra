import type { UIMessageChunk } from 'ai';

import type { Actor } from '../../iam/index.js';

import type { ConversationWithMessagesDto } from './conversation.dto.js';
import type { SendMessageDto } from './send-message.dto.js';

/**
 * A Member's Conversations with the Orchestrator in a Project. Only the
 * Member whose Conversation it is reaches it; to anyone else it does not exist
 * (404 `CONVERSATION_NOT_FOUND`).
 */
export abstract class ConversationsApi {
  abstract get(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
  ): Promise<ConversationWithMessagesDto>;

  /**
   * Sends the Member's message and streams the Orchestrator's answer as AI
   * SDK UI message chunks. The client chooses the id of a new Conversation
   * (a UUID); its first message creates it. The answer runs to the end even
   * if nobody reads the stream. Refused while an answer in the Conversation
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

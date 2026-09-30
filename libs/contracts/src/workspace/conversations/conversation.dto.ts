import type { UIMessage } from 'ai';

/** A Conversation of a Member with the Orchestrator in one Project. */
export type ConversationDto = {
  readonly id: string;
  /** Suggested by Intentra once the Conversation has begun; null until then. */
  readonly title: string | null;
  readonly hidden: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/** A Conversation with its messages, oldest first, in the AI SDK UI message format. */
export type ConversationWithMessagesDto = ConversationDto & {
  readonly messages: readonly UIMessage[];
};

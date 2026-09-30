import type { UIMessage } from 'ai';

/** A Conversation of a Member with the Orchestrator in one Project. */
export type ConversationDto = {
  readonly id: string;
  /** Suggested by Intentra once the Conversation has begun; null until then. */
  readonly title: string | null;
  readonly hidden: boolean;
  readonly createdAt: string;
  /** Its last message, or its last rename or hiding. */
  readonly updatedAt: string;
};

/** One page of a Member's Conversations in a Project, the latest activity first. */
export type ConversationPageDto = {
  readonly items: ConversationDto[];
  /** How many Conversations match, across every page. */
  readonly total: number;
};

/** A Conversation with its messages, oldest first, in the AI SDK UI message format. */
export type ConversationWithMessagesDto = ConversationDto & {
  readonly messages: readonly UIMessage[];
};

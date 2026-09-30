import type { ConversationWithMessagesDto } from '@intentra/contracts/workspace';

import type { Conversation } from '../../../domain/entities/index.js';
import type { ConversationId } from '../../../domain/value-objects/index.js';

/** One message of a Conversation, as the Agents' runtime keeps it. */
export type ConversationMessage =
  ConversationWithMessagesDto['messages'][number];

export type ConversationQueryProps = { readonly id: ConversationId };

/**
 * Where Conversations and their messages are kept: by the Agents' runtime,
 * outside our transactions.
 */
export abstract class ConversationStore {
  abstract findOne(props: ConversationQueryProps): Promise<Conversation | null>;
  /** Keeps a Conversation that has just started; its messages come from the Orchestrator. */
  abstract save(conversation: Conversation): Promise<void>;
  /** Its messages, oldest first. */
  abstract findMessages(id: ConversationId): Promise<ConversationMessage[]>;
}

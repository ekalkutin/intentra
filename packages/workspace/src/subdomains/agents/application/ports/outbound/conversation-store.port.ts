import type { ConversationWithMessagesDto } from '@intentra/contracts/workspace';
import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import type { MemberId } from '../../../../tenancy/index.js';
import type { Conversation } from '../../../domain/entities/index.js';
import type { ConversationId } from '../../../domain/value-objects/index.js';

/** One message of a Conversation, as the Agents' runtime keeps it. */
export type ConversationMessage =
  ConversationWithMessagesDto['messages'][number];

export type ConversationQueryProps = { readonly id: ConversationId };

/** A Member's own Conversations in a Project, shown or hidden ones, the latest activity first. */
export type ConversationListProps = {
  readonly memberId: MemberId;
  readonly projectId: ProjectId;
  readonly hidden: boolean;
  readonly take: number;
  readonly offset: number;
};

export type ConversationPage = {
  readonly items: Conversation[];
  readonly total: number;
};

export type ConversationDeleteProps =
  | { readonly workspaceId: WorkspaceId }
  | { readonly projectId: ProjectId }
  | { readonly memberId: MemberId };

/**
 * Where Conversations and their messages are kept: by the Agents' runtime,
 * outside our transactions.
 */
export abstract class ConversationStore {
  abstract findOne(props: ConversationQueryProps): Promise<Conversation | null>;
  abstract findMany(props: ConversationListProps): Promise<ConversationPage>;
  /** Keeps a Conversation that has just started; its messages come from Intentra. */
  abstract save(conversation: Conversation): Promise<void>;
  /** Keeps its title and whether it is hidden. */
  abstract update(conversation: Conversation): Promise<void>;
  /** Deletes it with its messages. */
  abstract delete(id: ConversationId): Promise<void>;
  abstract deleteMany(props: ConversationDeleteProps): Promise<void>;
  /** Its messages, oldest first. */
  abstract findMessages(id: ConversationId): Promise<ConversationMessage[]>;
}

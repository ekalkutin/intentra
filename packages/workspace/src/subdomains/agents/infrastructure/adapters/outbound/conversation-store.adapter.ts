import { toAISdkMessages } from '@mastra/ai-sdk/ui';
import type { StorageThreadType } from '@mastra/core/memory';
import { Memory } from '@mastra/memory';
import { Injectable, type Provider } from '@nestjs/common';

import {
  ConversationStore,
  type ConversationMessage,
  type ConversationQueryProps,
} from '../../../application/ports/outbound/index.js';
import { Conversation } from '../../../domain/entities/index.js';
import type { ConversationId } from '../../../domain/value-objects/index.js';

/** What a Mastra thread keeps of a Conversation besides its Member (`resourceId`) and title. */
type ConversationMetadata = {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly hidden: boolean;
};

/** A Conversation is a Mastra thread; its messages are the thread's. */
@Injectable()
export class ConversationStoreAdapter implements ConversationStore {
  constructor(private readonly memory: Memory) {}

  public async findOne({
    id,
  }: ConversationQueryProps): Promise<Conversation | null> {
    const thread = await this.memory.getThreadById({ threadId: id.value });

    return thread && toDomain(thread);
  }

  public async save(conversation: Conversation): Promise<void> {
    const metadata: ConversationMetadata = {
      workspaceId: conversation.workspaceId.value,
      projectId: conversation.projectId.value,
      hidden: conversation.hidden,
    };
    // An empty title lets Mastra suggest one after the first answer.
    await this.memory.createThread({
      threadId: conversation.id.value,
      resourceId: conversation.memberId.value,
      title: conversation.title?.value ?? '',
      metadata,
    });
  }

  public async findMessages(
    id: ConversationId,
  ): Promise<ConversationMessage[]> {
    const { messages } = await this.memory.recall({
      threadId: id.value,
      perPage: false,
    });

    return toAISdkMessages(messages, {
      version: 'v7',
    }) as unknown as ConversationMessage[];
  }
}

function toDomain(thread: StorageThreadType): Conversation {
  const metadata = thread.metadata as ConversationMetadata;

  return Conversation.restore({
    id: thread.id,
    workspaceId: metadata.workspaceId,
    projectId: metadata.projectId,
    memberId: thread.resourceId,
    title: thread.title || null,
    hidden: metadata.hidden,
    createdAt: Temporal.Instant.fromEpochMilliseconds(
      thread.createdAt.getTime(),
    ),
    updatedAt: Temporal.Instant.fromEpochMilliseconds(
      thread.updatedAt.getTime(),
    ),
  });
}

export const CONVERSATION_STORE_PROVIDER: Provider = {
  provide: ConversationStore,
  useClass: ConversationStoreAdapter,
};

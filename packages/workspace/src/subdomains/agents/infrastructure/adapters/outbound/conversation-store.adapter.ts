import { toAISdkMessages } from '@mastra/ai-sdk/ui';
import type { StorageThreadType } from '@mastra/core/memory';
import { Memory } from '@mastra/memory';
import { Injectable, type Provider } from '@nestjs/common';

import {
  ConversationStore,
  type ConversationDeleteProps,
  type ConversationListProps,
  type ConversationMessage,
  type ConversationPage,
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

  public async findMany({
    memberId,
    projectId,
    hidden,
    take,
    offset,
  }: ConversationListProps): Promise<ConversationPage> {
    // Mastra pages by page number: read up to the end of the page asked for.
    const { threads, total } = await this.memory.listThreads({
      filter: {
        resourceId: memberId.value,
        metadata: { projectId: projectId.value, hidden },
      },
      orderBy: { field: 'updatedAt', direction: 'DESC' },
      page: 0,
      perPage: offset + take,
    });

    return { items: threads.slice(offset).map(toDomain), total };
  }

  public async save(conversation: Conversation): Promise<void> {
    // An empty title lets Mastra suggest one after the first answer.
    await this.memory.createThread({
      threadId: conversation.id.value,
      resourceId: conversation.memberId.value,
      title: conversation.title?.value ?? '',
      metadata: toMetadata(conversation),
    });
  }

  public async update(conversation: Conversation): Promise<void> {
    await this.memory.updateThread({
      id: conversation.id.value,
      title: conversation.title?.value,
      metadata: toMetadata(conversation),
    });
  }

  public async delete(id: ConversationId): Promise<void> {
    await this.memory.deleteThread(id.value);
  }

  public async deleteMany(props: ConversationDeleteProps): Promise<void> {
    const { threads } = await this.memory.listThreads({
      filter:
        'memberId' in props
          ? { resourceId: props.memberId.value }
          : {
              metadata:
                'workspaceId' in props
                  ? { workspaceId: props.workspaceId.value }
                  : { projectId: props.projectId.value },
            },
      perPage: false,
    });
    for (const thread of threads) {
      await this.memory.deleteThread(thread.id);
    }
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

function toMetadata(conversation: Conversation): ConversationMetadata {
  return {
    workspaceId: conversation.workspaceId.value,
    projectId: conversation.projectId.value,
    hidden: conversation.hidden,
  };
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

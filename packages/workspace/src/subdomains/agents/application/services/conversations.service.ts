import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  ConversationsApi,
  ConversationWithMessagesDto,
  SendMessageDto,
} from '@intentra/contracts/workspace';
import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import {
  AccessResolver,
  type ProjectMembership,
} from '../../../tenancy/index.js';
import { Conversation } from '../../domain/entities/index.js';
import { ConversationId } from '../../domain/value-objects/index.js';
import {
  AgentNotConfiguredException,
  ConversationBusyException,
  ConversationNotFoundException,
} from '../exceptions/index.js';
import { toConversationWithMessagesDto } from '../mappers/index.js';
import {
  ConversationStore,
  Orchestrator,
  type AnswerStream,
} from '../ports/outbound/index.js';

/**
 * A Member's Conversations with the Orchestrator. One answer at a time per
 * Conversation, tracked in this process: it holds while the API runs as one
 * instance (`docs/notes/agents-open-questions.md`).
 */
@Injectable()
export class ConversationsService implements ConversationsApi {
  readonly #answering = new Set<string>();

  constructor(
    private readonly accessResolver: AccessResolver,
    private readonly conversationStore: ConversationStore,
    private readonly orchestrator: Orchestrator,
  ) {}

  public async get(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
  ): Promise<ConversationWithMessagesDto> {
    const membership = await this.resolve(actor, workspaceId, projectId);
    const conversation = await this.getConversation(
      membership,
      new ConversationId(conversationId),
    );
    const messages = await this.conversationStore.findMessages(conversation.id);

    return toConversationWithMessagesDto(conversation, messages);
  }

  public async send(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
    data: SendMessageDto,
  ): Promise<AnswerStream> {
    const membership = await this.resolve(actor, workspaceId, projectId);
    if (!this.orchestrator.isAvailable()) {
      throw new AgentNotConfiguredException();
    }
    const { member, project, projectRole } = membership;
    const id = new ConversationId(conversationId);
    const found = await this.conversationStore.findOne({ id });
    if (found && !found.isOf(member.id, project.id)) {
      throw new ConversationNotFoundException();
    }
    // Checked and taken with no await in between, so two messages cannot both pass.
    if (this.#answering.has(id.value)) {
      throw new ConversationBusyException();
    }
    this.#answering.add(id.value);

    try {
      const conversation =
        found ??
        Conversation.start({
          id: id.value,
          workspaceId: project.workspaceId.value,
          projectId: project.id.value,
          memberId: member.id.value,
        });
      if (!found) {
        await this.conversationStore.save(conversation);
      }
      const answer = await this.orchestrator.answer({
        conversation,
        actor,
        project,
        projectRole,
        message: data.message,
      });
      void answer.done.finally(() => this.#answering.delete(id.value));

      return answer.stream;
    } catch (error) {
      this.#answering.delete(id.value);
      throw error;
    }
  }

  private resolve(
    actor: Actor,
    workspaceId: string,
    projectId: string,
  ): Promise<ProjectMembership> {
    return this.accessResolver.resolveInProject(
      { actor, agent: null },
      new WorkspaceId(workspaceId),
      new ProjectId(projectId),
    );
  }

  /** Its Member's Conversation in this Project; to anyone else it does not exist. */
  private async getConversation(
    { member, project }: ProjectMembership,
    id: ConversationId,
  ): Promise<Conversation> {
    const conversation = await this.conversationStore.findOne({ id });
    if (!conversation?.isOf(member.id, project.id)) {
      throw new ConversationNotFoundException();
    }

    return conversation;
  }
}

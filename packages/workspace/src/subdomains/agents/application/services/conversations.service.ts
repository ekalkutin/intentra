import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  ConversationDto,
  ConversationPageDto,
  ConversationsApi,
  ConversationWithMessagesDto,
  EditConversationDto,
  ListConversationsDto,
  SendMessageDto,
} from '@intentra/contracts/workspace';
import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import {
  AccessResolver,
  type ProjectMembership,
} from '../../../tenancy/index.js';
import { AgentsContent, Conversation } from '../../domain/entities/index.js';
import { AgentsNotPublishableException } from '../../domain/exceptions/index.js';
import {
  ConversationId,
  type AgentsVersionNumber,
} from '../../domain/value-objects/index.js';
import {
  AgentsNotPublishedException,
  ConversationBusyException,
  ConversationNotFoundException,
  ProviderKeyMissingException,
} from '../exceptions/index.js';
import {
  toConversationDto,
  toConversationPageDto,
  toConversationWithMessagesDto,
} from '../mappers/index.js';
import {
  AgentsVersionRepository,
  ConversationStore,
  Intentra,
  ProviderKeyCipher,
  ProviderKeyRepository,
  ToolCatalog,
  UnpublishedAgentsRepository,
  type AnswerStream,
} from '../ports/outbound/index.js';

/**
 * A Member's Conversations with Intentra. While an answer runs, nothing
 * else changes the Conversation, tracked in this
 * process: it holds while the API runs as one instance
 * (`docs/notes/agents-open-questions.md`).
 */
@Injectable()
export class ConversationsService implements ConversationsApi {
  readonly #answering = new Set<string>();

  constructor(
    private readonly accessResolver: AccessResolver,
    private readonly conversationStore: ConversationStore,
    private readonly intentra: Intentra,
    private readonly providerKeyRepository: ProviderKeyRepository,
    private readonly providerKeyCipher: ProviderKeyCipher,
    private readonly unpublishedAgentsRepository: UnpublishedAgentsRepository,
    private readonly agentsVersionRepository: AgentsVersionRepository,
    private readonly toolCatalog: ToolCatalog,
  ) {}

  public async list(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    query: ListConversationsDto,
  ): Promise<ConversationPageDto> {
    const { member, project } = await this.resolve(
      actor,
      workspaceId,
      projectId,
    );
    const page = await this.conversationStore.findMany({
      memberId: member.id,
      projectId: project.id,
      hidden: query.hidden,
      take: query.take,
      offset: query.offset,
    });

    return toConversationPageDto(page);
  }

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

    return toConversationWithMessagesDto(
      conversation,
      messages,
      this.#answering.has(conversation.id.value),
    );
  }

  public async edit(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
    data: EditConversationDto,
  ): Promise<ConversationDto> {
    const membership = await this.resolveForChange(
      actor,
      workspaceId,
      projectId,
    );
    const conversation = await this.getConversation(
      membership,
      new ConversationId(conversationId),
    );
    this.ensureIdle(conversation.id);

    if (data.title !== undefined) {
      conversation.rename(data.title);
    }
    if (data.hidden === true) {
      conversation.hide();
    }
    if (data.hidden === false) {
      conversation.show();
    }
    await this.conversationStore.update(conversation);

    return toConversationDto(conversation);
  }

  public async delete(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
  ): Promise<void> {
    const membership = await this.resolveForChange(
      actor,
      workspaceId,
      projectId,
    );
    const conversation = await this.getConversation(
      membership,
      new ConversationId(conversationId),
    );
    this.ensureIdle(conversation.id);

    await this.conversationStore.delete(conversation.id);
  }

  public async send(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    conversationId: string,
    data: SendMessageDto,
  ): Promise<AnswerStream> {
    const { member, project, projectRole } = await this.resolveForChange(
      actor,
      workspaceId,
      projectId,
    );
    const providerKey = await this.providerKeyRepository.findOne({
      workspaceId: project.workspaceId,
    });
    if (!providerKey) {
      throw new ProviderKeyMissingException();
    }
    const { agents, agentsVersion } = await this.agentsFor(actor);
    const id = new ConversationId(conversationId);
    const found = await this.conversationStore.findOne({ id });
    if (found && !found.isOf(member.id, project.id)) {
      throw new ConversationNotFoundException();
    }
    // Checked and taken with no await in between, so two messages cannot both pass.
    this.ensureIdle(id);
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
      } else if (conversation.hidden) {
        conversation.show();
        await this.conversationStore.update(conversation);
      }
      const answer = await this.intentra.answer({
        conversation,
        actor,
        project,
        projectRole,
        message: data.message,
        providerKey: this.providerKeyCipher.decrypt(providerKey.encryptedKey),
        agents,
        agentsVersion,
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

  /** Refused while the Workspace is suspended: no AI works with it. */
  private resolveForChange(
    actor: Actor,
    workspaceId: string,
    projectId: string,
  ): Promise<ProjectMembership> {
    return this.accessResolver.resolveInProjectForChange(
      { actor, agent: null },
      new WorkspaceId(workspaceId),
      new ProjectId(projectId),
    );
  }

  /**
   * The Published Agents, as at the moment of the message; in a Platform
   * Admin's own Conversation, the Unpublished Agents, which must be
   * publishable to run.
   */
  private async agentsFor(actor: Actor): Promise<{
    agents: AgentsContent;
    agentsVersion: AgentsVersionNumber | null;
  }> {
    if (actor.isPlatformAdmin) {
      const unpublished = await this.unpublishedAgentsRepository.findOne();
      const agents = unpublished?.content ?? AgentsContent.empty();
      const problems = agents.problems(
        this.toolCatalog.list().map(tool => tool.name),
      );
      if (problems.length > 0) {
        throw new AgentsNotPublishableException(problems);
      }

      return { agents, agentsVersion: null };
    }
    const published = await this.agentsVersionRepository.findOne({
      latest: true,
    });
    if (!published) {
      throw new AgentsNotPublishedException();
    }

    return { agents: published.content, agentsVersion: published.number };
  }

  private ensureIdle(id: ConversationId): void {
    if (this.#answering.has(id.value)) {
      throw new ConversationBusyException();
    }
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

import { Injectable } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type {
  AgentsChangesDto,
  AgentsVersionDto,
  AgentsVersionSummaryDto,
  AgentToolDto,
  ModelProfileDto,
  PlatformAgentDto,
  PlatformAgentsApi,
  PublishAgentsDto,
  SaveAgentDto,
  SaveModelProfileDto,
  SaveSkillDto,
  SkillDto,
  UnpublishedAgentsDto,
} from '@intentra/contracts/workspace';
import { AccountId, Email, UnitOfWork } from '@intentra/shared-kernel';

import {
  AgentsVersion,
  UnpublishedAgents,
} from '../../domain/entities/index.js';
import { AgentsPublishingService } from '../../domain/services/index.js';
import {
  AgentId,
  AgentsVersionNumber,
  ModelProfileId,
  Publisher,
  PublishingNote,
  SkillId,
  type ToolName,
} from '../../domain/value-objects/index.js';
import { NotPlatformAdminException } from '../exceptions/index.js';
import {
  toAgentsChangesDto,
  toAgentSpec,
  toAgentsVersionDto,
  toAgentsVersionSummaryDto,
  toAgentToolDto,
  toModelProfileDto,
  toModelProfileSpec,
  toPlatformAgentDto,
  toSkillDto,
  toSkillSpec,
  toUnpublishedAgentsDto,
} from '../mappers/index.js';
import {
  AgentsVersionRepository,
  FirstAgentsVersion,
  ToolCatalog,
  UnpublishedAgentsRepository,
} from '../ports/outbound/index.js';

type AgentsState = {
  readonly unpublished: UnpublishedAgents;
  readonly published: AgentsVersion;
};

/**
 * A Platform Admin's work on Intentra's Agents. Agents Version 1 is made
 * from what the code held, the first time anything asks for the Agents.
 */
@Injectable()
export class PlatformAgentsService implements PlatformAgentsApi {
  readonly #agentsPublishingService = new AgentsPublishingService();

  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly unpublishedAgentsRepository: UnpublishedAgentsRepository,
    private readonly agentsVersionRepository: AgentsVersionRepository,
    private readonly toolCatalog: ToolCatalog,
    private readonly firstAgentsVersion: FirstAgentsVersion,
  ) {}

  public async getUnpublished(actor: Actor): Promise<UnpublishedAgentsDto> {
    return this.withAgents(actor, ({ unpublished }) =>
      toUnpublishedAgentsDto(unpublished),
    );
  }

  public async createAgent(
    actor: Actor,
    data: SaveAgentDto,
  ): Promise<PlatformAgentDto> {
    const spec = toAgentSpec(data);

    return this.edit(actor, unpublished =>
      toPlatformAgentDto(
        unpublished.addSpecialist(spec, this.availableTools()),
      ),
    );
  }

  public async editAgent(
    actor: Actor,
    agentId: string,
    data: SaveAgentDto,
  ): Promise<PlatformAgentDto> {
    const id = new AgentId(agentId);
    const spec = toAgentSpec(data);

    return this.edit(actor, unpublished =>
      toPlatformAgentDto(
        unpublished.editAgent(id, spec, this.availableTools()),
      ),
    );
  }

  public async deleteAgent(actor: Actor, agentId: string): Promise<void> {
    const id = new AgentId(agentId);

    await this.edit(actor, unpublished => unpublished.removeAgent(id));
  }

  public async createSkill(
    actor: Actor,
    data: SaveSkillDto,
  ): Promise<SkillDto> {
    const spec = toSkillSpec(data);

    return this.edit(actor, unpublished =>
      toSkillDto(unpublished.addSkill(spec)),
    );
  }

  public async editSkill(
    actor: Actor,
    skillId: string,
    data: SaveSkillDto,
  ): Promise<SkillDto> {
    const id = new SkillId(skillId);
    const spec = toSkillSpec(data);

    return this.edit(actor, unpublished =>
      toSkillDto(unpublished.editSkill(id, spec)),
    );
  }

  public async deleteSkill(actor: Actor, skillId: string): Promise<void> {
    const id = new SkillId(skillId);

    await this.edit(actor, unpublished => unpublished.removeSkill(id));
  }

  public async createModelProfile(
    actor: Actor,
    data: SaveModelProfileDto,
  ): Promise<ModelProfileDto> {
    const spec = toModelProfileSpec(data);

    return this.edit(actor, unpublished =>
      toModelProfileDto(unpublished.addModelProfile(spec)),
    );
  }

  public async editModelProfile(
    actor: Actor,
    modelProfileId: string,
    data: SaveModelProfileDto,
  ): Promise<ModelProfileDto> {
    const id = new ModelProfileId(modelProfileId);
    const spec = toModelProfileSpec(data);

    return this.edit(actor, unpublished =>
      toModelProfileDto(unpublished.editModelProfile(id, spec)),
    );
  }

  public async deleteModelProfile(
    actor: Actor,
    modelProfileId: string,
  ): Promise<void> {
    const id = new ModelProfileId(modelProfileId);

    await this.edit(actor, unpublished => unpublished.removeModelProfile(id));
  }

  public async listTools(actor: Actor): Promise<AgentToolDto[]> {
    this.ensurePlatformAdmin(actor);

    return this.toolCatalog.list().map(toAgentToolDto);
  }

  public async getChanges(actor: Actor): Promise<AgentsChangesDto> {
    return this.withAgents(actor, ({ unpublished, published }) =>
      toAgentsChangesDto(unpublished.content.changesSince(published.content)),
    );
  }

  public async publish(
    actor: Actor,
    data: PublishAgentsDto,
  ): Promise<AgentsVersionSummaryDto> {
    const note = toNote(data);

    return this.withAgents(actor, async ({ unpublished, published }) => {
      const version = this.#agentsPublishingService.publish(
        unpublished,
        published,
        this.availableTools(),
        toPublisher(actor),
        note,
      );

      return this.saveVersion(unpublished, version);
    });
  }

  public async listVersions(actor: Actor): Promise<AgentsVersionSummaryDto[]> {
    return this.withAgents(actor, async () =>
      (await this.agentsVersionRepository.findMany()).map(
        toAgentsVersionSummaryDto,
      ),
    );
  }

  public async getVersion(
    actor: Actor,
    number: number,
  ): Promise<AgentsVersionDto> {
    return this.withAgents(actor, async () =>
      toAgentsVersionDto(
        await this.agentsVersionRepository.getOne({
          number: new AgentsVersionNumber(number),
        }),
      ),
    );
  }

  public async republish(
    actor: Actor,
    number: number,
    data: PublishAgentsDto,
  ): Promise<AgentsVersionSummaryDto> {
    const note = toNote(data);

    return this.withAgents(actor, async ({ unpublished, published }) => {
      const earlier = await this.agentsVersionRepository.getOne({
        number: new AgentsVersionNumber(number),
      });
      const version = this.#agentsPublishingService.republish(
        unpublished,
        published,
        earlier,
        this.availableTools(),
        toPublisher(actor),
        note,
      );

      return this.saveVersion(unpublished, version);
    });
  }

  private async saveVersion(
    unpublished: UnpublishedAgents,
    version: AgentsVersion,
  ): Promise<AgentsVersionSummaryDto> {
    await this.agentsVersionRepository.save(version);
    await this.unpublishedAgentsRepository.save(unpublished);

    return toAgentsVersionSummaryDto(version);
  }

  /** Runs `work` on the Agents in one transaction, for a Platform Admin only. */
  private withAgents<T>(
    actor: Actor,
    work: (state: AgentsState) => T | Promise<T>,
  ): Promise<T> {
    this.ensurePlatformAdmin(actor);

    return this.unitOfWork.run(async () => work(await this.load()));
  }

  /** Changes the Unpublished Agents with `change` and keeps them. */
  private edit<T>(
    actor: Actor,
    change: (unpublished: UnpublishedAgents) => T,
  ): Promise<T> {
    return this.withAgents(actor, async ({ unpublished }) => {
      const result = change(unpublished);
      await this.unpublishedAgentsRepository.save(unpublished);

      return result;
    });
  }

  /** The Unpublished and Published Agents, made from the code's Agents the first time. */
  private async load(): Promise<AgentsState> {
    const published =
      (await this.agentsVersionRepository.findOne({ latest: true })) ??
      (await this.saveFirstVersion());
    const unpublished =
      (await this.unpublishedAgentsRepository.findOne()) ??
      UnpublishedAgents.startFrom(published.content, published.number);

    return { unpublished, published };
  }

  private async saveFirstVersion(): Promise<AgentsVersion> {
    const first = AgentsVersion.first(this.firstAgentsVersion.content());
    await this.agentsVersionRepository.save(first);
    await this.unpublishedAgentsRepository.save(
      UnpublishedAgents.startFrom(first.content, first.number),
    );

    return first;
  }

  private availableTools(): ToolName[] {
    return this.toolCatalog.list().map(tool => tool.name);
  }

  private ensurePlatformAdmin(actor: Actor): void {
    if (!actor.isPlatformAdmin) {
      throw new NotPlatformAdminException();
    }
  }
}

function toPublisher(actor: Actor): Publisher {
  return new Publisher(new AccountId(actor.accountId), new Email(actor.email));
}

function toNote(data: PublishAgentsDto): PublishingNote | null {
  return data.note === null || data.note.trim() === ''
    ? null
    : new PublishingNote(data.note);
}

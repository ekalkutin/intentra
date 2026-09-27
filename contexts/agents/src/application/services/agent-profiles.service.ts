import { Inject, Injectable } from '@nestjs/common';

import {
  type AgentProfileDto,
  type AgentProfilesApi,
  type CreateAgentProfileDto,
  type UpdateAgentProfileDto,
} from '@intentra/contracts/agents';
import { WorkspaceId } from '@intentra/shared';

import { AgentProfile } from '../../domain/entities/index.js';
import {
  AgentName,
  AgentProfileId,
  Instructions,
  ModelRef,
  ToolId,
} from '../../domain/value-objects/index.js';
import {
  AgentProfileNotFoundException,
  UnknownToolException,
} from '../exceptions/index.js';
import { toAgentProfileDto } from '../mappers/index.js';
import { AgentProfileRepository, ToolCatalog } from '../ports/index.js';

@Injectable()
export class AgentProfilesService implements AgentProfilesApi {
  constructor(
    @Inject(AgentProfileRepository)
    private readonly agentProfileRepository: AgentProfileRepository,

    @Inject(ToolCatalog)
    private readonly toolCatalog: ToolCatalog,
  ) {}

  public async create(
    workspaceId: string,
    data: CreateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    const profile = AgentProfile.create({
      workspaceId: new WorkspaceId(workspaceId),
      name: new AgentName(data.name),
      instructions: new Instructions(data.instructions),
      model: new ModelRef(data.model.provider, data.model.name),
    });
    profile.replaceTools(this.#toAvailableTools(data.tools ?? []));

    await this.agentProfileRepository.save(profile);
    return toAgentProfileDto(profile);
  }

  public async find(workspaceId: string): Promise<AgentProfileDto[]> {
    const profiles = await this.agentProfileRepository.findActiveByWorkspace(
      new WorkspaceId(workspaceId),
    );
    return profiles.map(toAgentProfileDto);
  }

  public async getById(
    workspaceId: string,
    id: string,
  ): Promise<AgentProfileDto> {
    return toAgentProfileDto(await this.#getActive(workspaceId, id));
  }

  public async update(
    workspaceId: string,
    id: string,
    data: UpdateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    const profile = await this.#getActive(workspaceId, id);

    if (data.name !== undefined) {
      profile.rename(new AgentName(data.name));
    }
    if (data.instructions !== undefined) {
      profile.changeInstructions(new Instructions(data.instructions));
    }
    if (data.model !== undefined) {
      profile.changeModel(new ModelRef(data.model.provider, data.model.name));
    }
    if (data.tools !== undefined) {
      profile.replaceTools(this.#toAvailableTools(data.tools));
    }

    await this.agentProfileRepository.save(profile);
    return toAgentProfileDto(profile);
  }

  public async delete(workspaceId: string, id: string): Promise<void> {
    const profile = await this.#getActive(workspaceId, id);
    profile.archive();
    await this.agentProfileRepository.save(profile);
  }

  /** New tools must be in the catalog; stored ones are not checked again. */
  #toAvailableTools(ids: readonly string[]): ToolId[] {
    return ids.map(id => {
      const tool = new ToolId(id);
      if (!this.toolCatalog.isAvailable(tool)) {
        throw new UnknownToolException(tool);
      }
      return tool;
    });
  }

  /** An archived profile counts as deleted, so it is not found either. */
  async #getActive(workspaceId: string, id: string): Promise<AgentProfile> {
    const profile = await this.agentProfileRepository.getById(
      new WorkspaceId(workspaceId),
      new AgentProfileId(id),
    );
    if (profile.isArchived) {
      throw new AgentProfileNotFoundException(id);
    }
    return profile;
  }
}

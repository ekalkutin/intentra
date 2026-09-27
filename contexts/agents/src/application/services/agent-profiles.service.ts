import { Inject, Injectable } from '@nestjs/common';

import type {
  AgentProfileDto,
  AgentProfilesApi,
  CreateAgentProfileDto,
  UpdateAgentProfileDto,
} from '@intentra/contracts/agents';
import { WorkspaceId } from '@intentra/shared';

import { AgentProfile } from '../../domain/agent-profile/agent-profile.aggregate.js';
import { AgentName } from '../../domain/value-objects/agent-name.vo.js';
import { AgentProfileId } from '../../domain/value-objects/agent-profile-id.vo.js';
import { Instructions } from '../../domain/value-objects/instructions.vo.js';
import { ModelRef } from '../../domain/value-objects/model-ref.vo.js';
import { ToolId } from '../../domain/value-objects/tool-id.vo.js';
import { UnknownToolError } from '../errors/unknown-tool.error.js';
import { toAgentProfileDto } from '../mappers/agent-profile.mapper.js';
import { AgentProfileRepository } from '../ports/agent-profile-repository.port.js';
import { ToolCatalog } from '../ports/tool-catalog.port.js';

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

  public async findById(
    workspaceId: string,
    id: string,
  ): Promise<AgentProfileDto | null> {
    const profile = await this.#findActive(workspaceId, id);
    return profile ? toAgentProfileDto(profile) : null;
  }

  public async update(
    workspaceId: string,
    id: string,
    data: UpdateAgentProfileDto,
  ): Promise<AgentProfileDto | null> {
    const profile = await this.#findActive(workspaceId, id);
    if (!profile) {
      return null;
    }

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
    const profile = await this.#findActive(workspaceId, id);
    if (!profile) {
      return;
    }

    profile.archive();
    await this.agentProfileRepository.save(profile);
  }

  /** New tools must be in the catalog; stored ones are not checked again. */
  #toAvailableTools(ids: readonly string[]): ToolId[] {
    return ids.map(id => {
      const tool = new ToolId(id);
      if (!this.toolCatalog.isAvailable(tool)) {
        throw new UnknownToolError(tool);
      }
      return tool;
    });
  }

  /** An archived profile counts as deleted, so it is not found either. */
  async #findActive(
    workspaceId: string,
    id: string,
  ): Promise<AgentProfile | null> {
    const profile = await this.agentProfileRepository.findById(
      new WorkspaceId(workspaceId),
      new AgentProfileId(id),
    );
    return profile && !profile.isArchived ? profile : null;
  }
}

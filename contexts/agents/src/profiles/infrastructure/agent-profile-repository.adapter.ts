import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { WorkspaceId } from '@intentra/shared';

import { AgentProfileRepository } from '../application/ports/agent-profile-repository.port.js';
import { AgentProfile } from '../domain/agent-profile.aggregate.js';
import { AgentName } from '../domain/value-objects/agent-name.vo.js';
import { AgentProfileId } from '../domain/value-objects/agent-profile-id.vo.js';
import { Instructions } from '../domain/value-objects/instructions.vo.js';
import { ModelRef } from '../domain/value-objects/model-ref.vo.js';
import { ToolId } from '../domain/value-objects/tool-id.vo.js';

import { AgentProfileModel } from './agent-profile.schema.js';

@Injectable()
export class AgentProfileRepositoryAdapter extends AgentProfileRepository {
  constructor(
    @InjectModel(AgentProfileModel.name)
    private readonly agentProfileModel: Model<AgentProfileModel>,
  ) {
    super();
  }

  /** Inserts a new profile or replaces the stored one. */
  public async save(profile: AgentProfile): Promise<void> {
    await this.agentProfileModel
      .replaceOne(
        { _id: profile.id.value, workspaceId: profile.workspaceId.value },
        this.toDocument(profile),
        { upsert: true },
      )
      .exec();
  }

  public async findById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile | null> {
    const profile = await this.agentProfileModel
      .findOne({ _id: id.value, workspaceId: workspaceId.value })
      .exec();
    return profile ? this.toDomain(profile) : null;
  }

  public async findActiveByWorkspace(
    workspaceId: WorkspaceId,
  ): Promise<AgentProfile[]> {
    const profiles = await this.agentProfileModel
      .find({ workspaceId: workspaceId.value, archivedAt: null })
      .exec();
    return profiles.map(profile => this.toDomain(profile));
  }

  private toDocument(profile: AgentProfile): AgentProfileModel {
    return {
      _id: profile.id.value,
      workspaceId: profile.workspaceId.value,
      name: profile.name.value,
      instructions: profile.instructions.value,
      modelProvider: profile.model.provider,
      modelName: profile.model.name,
      tools: profile.tools.map(tool => tool.value),
      archivedAt: profile.archivedAt,
    };
  }

  private toDomain(profile: AgentProfileModel): AgentProfile {
    return AgentProfile.reconstitute(new AgentProfileId(profile._id), {
      workspaceId: new WorkspaceId(profile.workspaceId),
      name: new AgentName(profile.name),
      instructions: new Instructions(profile.instructions),
      model: new ModelRef(profile.modelProvider, profile.modelName),
      tools: profile.tools.map(tool => ToolId.from(tool)),
      archivedAt: profile.archivedAt,
    });
  }
}

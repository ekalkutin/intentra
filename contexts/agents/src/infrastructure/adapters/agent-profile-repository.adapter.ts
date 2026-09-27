import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Timestamp, WorkspaceId } from '@intentra/shared';

import { AgentProfileRepository } from '../../application/ports/index.js';
import { AgentProfile } from '../../domain/entities/index.js';
import {
  AgentDescription,
  AgentName,
  AgentProfileId,
  AgentRole,
  Instructions,
  ModelId,
  ToolId,
} from '../../domain/value-objects/index.js';
import { AgentProfileModel } from '../database/index.js';

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

  /** The unique index turns a lost race into an update of nothing. */
  public async addOrchestratorIfAbsent(
    orchestrator: AgentProfile,
  ): Promise<void> {
    await this.agentProfileModel
      .updateOne(
        {
          workspaceId: orchestrator.workspaceId.value,
          role: AgentRole.ORCHESTRATOR.value,
        },
        { $setOnInsert: this.toDocument(orchestrator) },
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

  public async findOrchestrator(
    workspaceId: WorkspaceId,
  ): Promise<AgentProfile | null> {
    const profile = await this.agentProfileModel
      .findOne({
        workspaceId: workspaceId.value,
        role: AgentRole.ORCHESTRATOR.value,
      })
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
      role: profile.role.value,
      name: profile.name.value,
      description: profile.description.value,
      instructions: profile.instructions.value,
      model: profile.model.value,
      tools: profile.tools.map(tool => tool.value),
      archivedAt: profile.archivedAt?.toDate() ?? null,
    };
  }

  private toDomain(profile: AgentProfileModel): AgentProfile {
    return AgentProfile.reconstitute(new AgentProfileId(profile._id), {
      workspaceId: new WorkspaceId(profile.workspaceId),
      role: AgentRole.from(profile.role),
      name: new AgentName(profile.name),
      description: new AgentDescription(profile.description),
      instructions: new Instructions(profile.instructions),
      model: new ModelId(profile.model),
      tools: profile.tools.map(tool => new ToolId(tool)),
      archivedAt: profile.archivedAt && Timestamp.fromDate(profile.archivedAt),
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';

import { WorkspaceId } from '@intentra/shared';

import { AgentProfileRepository } from '../../application/ports/agent-profile-repository.port.js';
import { AgentProfile } from '../../domain/entities/agent-profile.aggregate.js';
import { AgentName } from '../../domain/value-objects/agent-name.vo.js';
import { AgentProfileId } from '../../domain/value-objects/agent-profile-id.vo.js';
import { Instructions } from '../../domain/value-objects/instructions.vo.js';
import { ModelRef } from '../../domain/value-objects/model-ref.vo.js';
import { ToolId } from '../../domain/value-objects/tool-id.vo.js';
import { AgentsDatabase } from '../database/agents-database.js';

type AgentProfileRow = {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly instructions: string;
  readonly modelProvider: string;
  readonly modelName: string;
  readonly tools: readonly string[];
  readonly archivedAt: Temporal.Instant | null;
};

@Injectable()
export class AgentProfileRepositoryAdapter extends AgentProfileRepository {
  constructor(
    @Inject(AgentsDatabase)
    private readonly database: AgentsDatabase,
  ) {
    super();
  }

  /** Inserts a new profile or replaces the stored one. */
  public async save(profile: AgentProfile): Promise<void> {
    const row = this.toRow(profile);
    await this.database.orm.public.AgentProfile.upsert({
      create: row,
      update: row,
    });
  }

  public async findById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile | null> {
    const profile = await this.database.orm.public.AgentProfile.first({
      id: id.value,
      workspaceId: workspaceId.value,
    });
    return profile ? this.toDomain(profile) : null;
  }

  public async findActiveByWorkspace(
    workspaceId: WorkspaceId,
  ): Promise<AgentProfile[]> {
    const profiles = await this.database.orm.public.AgentProfile.where({
      workspaceId: workspaceId.value,
    })
      .where(profile => profile.archivedAt.isNull())
      .all();
    return profiles.map(profile => this.toDomain(profile));
  }

  private toRow(profile: AgentProfile): AgentProfileRow {
    return {
      id: profile.id.value,
      workspaceId: profile.workspaceId.value,
      name: profile.name.value,
      instructions: profile.instructions.value,
      modelProvider: profile.model.provider,
      modelName: profile.model.name,
      tools: profile.tools.map(tool => tool.value),
      archivedAt: profile.archivedAt
        ? Temporal.Instant.fromEpochMilliseconds(profile.archivedAt.getTime())
        : null,
    };
  }

  private toDomain(profile: AgentProfileRow): AgentProfile {
    return AgentProfile.reconstitute(new AgentProfileId(profile.id), {
      workspaceId: new WorkspaceId(profile.workspaceId),
      name: new AgentName(profile.name),
      instructions: new Instructions(profile.instructions),
      model: new ModelRef(profile.modelProvider, profile.modelName),
      tools: profile.tools.map(tool => new ToolId(tool)),
      archivedAt: profile.archivedAt
        ? new Date(profile.archivedAt.epochMilliseconds)
        : null,
    });
  }
}

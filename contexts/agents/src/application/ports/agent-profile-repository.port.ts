import type { WorkspaceId } from '@intentra/shared';

import type { AgentProfile } from '../../domain/entities/index.js';
import type { AgentProfileId } from '../../domain/value-objects/index.js';
import { AgentProfileNotFoundException } from '../exceptions/index.js';

export abstract class AgentProfileRepository {
  abstract save(profile: AgentProfile): Promise<void>;
  /**
   * Saves the orchestrator unless the workspace already has one: two first
   * requests at once must not make two.
   */
  abstract addOrchestratorIfAbsent(orchestrator: AgentProfile): Promise<void>;
  /** Archived profiles too. */
  abstract findById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile | null>;
  abstract findOrchestrator(
    workspaceId: WorkspaceId,
  ): Promise<AgentProfile | null>;
  abstract findActiveByWorkspace(
    workspaceId: WorkspaceId,
  ): Promise<AgentProfile[]>;

  public async getById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile> {
    const profile = await this.findById(workspaceId, id);
    if (!profile) {
      throw new AgentProfileNotFoundException(id.value);
    }
    return profile;
  }

  public async getActiveById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile> {
    const profile = await this.getById(workspaceId, id);
    if (profile.isArchived) {
      throw new AgentProfileNotFoundException(id.value);
    }
    return profile;
  }
}

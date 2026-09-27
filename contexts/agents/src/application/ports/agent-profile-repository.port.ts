import type { WorkspaceId } from '@intentra/shared';

import type { AgentProfile } from '../../domain/entities/index.js';
import type { AgentProfileId } from '../../domain/value-objects/index.js';
import { AgentProfileNotFoundException } from '../exceptions/index.js';

export abstract class AgentProfileRepository {
  abstract save(profile: AgentProfile): Promise<void>;
  /** Archived profiles too. */
  abstract findById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile | null>;
  /** Profiles of the workspace that are not archived. */
  abstract findActiveByWorkspace(
    workspaceId: WorkspaceId,
  ): Promise<AgentProfile[]>;

  /** Archived profiles too. Throws `AgentProfileNotFoundException`. */
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
}

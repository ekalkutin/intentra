import type {
  AgentProfileDto,
  CreateAgentProfileDto,
  UpdateAgentProfileDto,
} from './agent-profile.dto.js';

/**
 * Agent profiles of a workspace. Reached through `AgentsApi.profiles`.
 * A deleted profile is archived: it stays for history but is no longer found.
 */
export interface AgentProfilesApi {
  create(
    workspaceId: string,
    data: CreateAgentProfileDto,
  ): Promise<AgentProfileDto>;
  find(workspaceId: string): Promise<AgentProfileDto[]>;
  /** `null` when there is no such profile in the workspace. */
  findById(workspaceId: string, id: string): Promise<AgentProfileDto | null>;
  /** `null` when there is no such profile in the workspace. */
  update(
    workspaceId: string,
    id: string,
    data: UpdateAgentProfileDto,
  ): Promise<AgentProfileDto | null>;
  /** Idempotent: deleting a missing profile does nothing. */
  delete(workspaceId: string, id: string): Promise<void>;
}

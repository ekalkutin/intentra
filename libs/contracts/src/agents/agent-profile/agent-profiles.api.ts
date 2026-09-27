import type {
  AgentProfileDto,
  CreateAgentProfileDto,
  UpdateAgentProfileDto,
} from './agent-profile.dto.js';

/**
 * Agent profiles of a workspace. Reached through `AgentsApi.profiles`.
 * A deleted profile is archived: it stays for history but is no longer found.
 * A profile missing from the workspace, or archived, throws
 * `AGENT_PROFILE_NOT_FOUND` (404).
 */
export interface AgentProfilesApi {
  create(
    workspaceId: string,
    data: CreateAgentProfileDto,
  ): Promise<AgentProfileDto>;
  find(workspaceId: string): Promise<AgentProfileDto[]>;
  getById(workspaceId: string, id: string): Promise<AgentProfileDto>;
  update(
    workspaceId: string,
    id: string,
    data: UpdateAgentProfileDto,
  ): Promise<AgentProfileDto>;
  delete(workspaceId: string, id: string): Promise<void>;
}

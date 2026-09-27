import type { AgentToolDto } from './tool.dto.js';

/** The tools an agent profile may be given. Reached through `AgentsApi.tools`. */
export interface AgentToolsApi {
  find(): Promise<AgentToolDto[]>;
}

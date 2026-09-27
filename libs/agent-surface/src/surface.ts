import type { IamApi } from '@intentra/contracts/iam';
import type { WorkspaceApi } from '@intentra/contracts/workspace';

/**
 * The published APIs tools and resources read from. Bound by whoever serves
 * them: the MCP adapter in the gateway, or the agents context.
 */
export type ToolApis = {
  readonly iam: IamApi;
  readonly workspace: WorkspaceApi;
};

/** On whose behalf a tool runs or a resource is read. */
export type Caller = {
  readonly accountId: string;
};

/**
 * Where a tool or resource is offered. Both flags are required, so every entry
 * states it explicitly and nothing is exposed by default.
 */
export type Exposure = {
  /** External agents (Claude Code, Codex, IDEs) through the MCP server. */
  readonly mcp: boolean;
  /** Intentra's own agents, through their agent profiles and runs. */
  readonly agents: boolean;
};

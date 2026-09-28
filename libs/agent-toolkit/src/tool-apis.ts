import type { AgentsApi } from '@intentra/contracts/agents';
import type { IamApi } from '@intentra/contracts/iam';
import type { WorkspaceApi } from '@intentra/contracts/workspace';

/**
 * The published APIs tools read from and write to, passed in Mastra's
 * `requestContext` by whoever runs the tools.
 */
export type ToolApis = {
  readonly iam: IamApi;
  readonly workspace: WorkspaceApi;
  readonly agents: AgentsApi;
};

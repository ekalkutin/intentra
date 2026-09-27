import type { z } from 'zod';

import type { IamApi } from '@intentra/contracts/iam';
import type { WorkspaceApi } from '@intentra/contracts/workspace';

/** The published APIs a tool may call. Bound by whoever runs the tool. */
export type ToolApis = {
  readonly iam: IamApi;
  readonly workspace: WorkspaceApi;
};

/**
 * Where a tool is offered. Both flags are required, so every tool states it
 * explicitly and nothing is exposed by default.
 */
export type ToolExposure = {
  /** External agents (Claude Code, Codex, IDEs) through the MCP server. */
  readonly mcp: boolean;
  /** Intentra's own agents, through their agent profiles. */
  readonly agents: boolean;
};

/**
 * One tool, described once for every place it is offered. The output is always
 * an object: MCP requires structured results to be one, so a list is wrapped.
 */
export type ToolDefinition<
  TInput extends z.ZodObject = z.ZodObject,
  TOutput extends z.ZodObject = z.ZodObject,
> = {
  /** Public name, `snake_case`. For MCP tools it is part of the public API. */
  readonly id: string;
  readonly description: string;
  readonly input: TInput;
  readonly output: TOutput;
  /** A tool that changes data is never offered through MCP. */
  readonly readOnly: boolean;
  readonly exposure: ToolExposure;
  run(apis: ToolApis, input: z.infer<TInput>): Promise<z.infer<TOutput>>;
};

export function defineTool<
  TInput extends z.ZodObject,
  TOutput extends z.ZodObject,
>(tool: ToolDefinition<TInput, TOutput>): ToolDefinition<TInput, TOutput> {
  return tool;
}

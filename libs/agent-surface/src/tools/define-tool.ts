import type { z } from 'zod';

import type { Caller, Exposure, ToolApis } from '../surface.js';

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
  readonly exposure: Exposure;
  run(
    apis: ToolApis,
    input: z.infer<TInput>,
    caller: Caller,
  ): Promise<z.infer<TOutput>>;
};

export function defineTool<
  TInput extends z.ZodObject,
  TOutput extends z.ZodObject,
>(tool: ToolDefinition<TInput, TOutput>): ToolDefinition<TInput, TOutput> {
  return tool;
}

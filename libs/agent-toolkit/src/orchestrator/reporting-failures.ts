import type { ToolsInput } from '@mastra/core/agent';

/** Receives an error no tool expected, which the model sees only as `INTERNAL`. */
export type UnexpectedErrorListener = (error: unknown) => void;

type Execute = (...args: unknown[]) => Promise<unknown>;

/**
 * Tools whose failures reach the model as `CODE: message`, as over MCP, so
 * that it can act on them: read again, ask the person. An error without a
 * code tells the model nothing useful and may reveal internals: it gets
 * `INTERNAL`, and the listener gets the error.
 */
export function reportingFailures<const Tools extends ToolsInput>(
  tools: Tools,
  onUnexpectedError: UnexpectedErrorListener,
): Tools {
  return Object.fromEntries(
    Object.entries(tools).map(([id, tool]) => {
      const execute = (tool as { execute?: Execute }).execute;
      if (!execute) return [id, tool];

      const reporting = Object.assign(
        Object.create(Object.getPrototypeOf(tool) as object | null) as object,
        tool,
        {
          execute: async (...args: unknown[]) => {
            try {
              return await execute(...args);
            } catch (error) {
              throw toReportedError(error, onUnexpectedError);
            }
          },
        },
      );

      return [id, reporting];
    }),
  ) as Tools;
}

function toReportedError(
  error: unknown,
  onUnexpectedError: UnexpectedErrorListener,
): Error {
  if (
    error instanceof Error &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return new Error(`${error.code}: ${error.message}`, { cause: error });
  }
  onUnexpectedError(error);

  return new Error('INTERNAL: Something went wrong on the server', {
    cause: error,
  });
}

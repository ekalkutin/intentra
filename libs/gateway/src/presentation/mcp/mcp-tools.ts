import type { RequestContext } from '@mastra/core/request-context';
import { isValidationError, noopObserve, type Tool } from '@mastra/core/tools';
import type { CallToolResult, McpServer } from '@modelcontextprotocol/server';

// oxlint-disable-next-line typescript/no-explicit-any -- tools differ in their schemas and request contexts
type McpTool = Tool<any, any, any, any, any, any, any>;

type McpTools = Readonly<Record<string, McpTool>>;

/**
 * Serves Mastra tools on the official MCP SDK server: unlike Mastra's own
 * MCPServer, it still answers clients on the 2025 protocol revisions (Codex).
 */
export function registerMcpTools(
  server: McpServer,
  tools: McpTools,
  requestContext: RequestContext,
): void {
  for (const tool of Object.values(tools)) {
    const { execute } = tool;
    if (!execute) continue;

    server.registerTool(
      tool.id,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
        annotations: tool.mcp?.annotations,
      },
      async input => {
        let result;
        try {
          result = await execute(input, {
            observe: noopObserve,
            requestContext,
          });
        } catch (error) {
          return toErrorResult(error);
        }
        if (isValidationError(result)) {
          return errorResult(result.message);
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result,
        };
      },
    );
  }
}

/**
 * An expected failure (it has a code, such as `KNOWLEDGE_ITEM_CHANGED`) goes
 * back to the agent, so that it can act on it: read again, ask the person.
 */
function toErrorResult(error: unknown): CallToolResult {
  if (
    error instanceof Error &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return errorResult(`${error.code}: ${error.message}`);
  }

  throw error;
}

function errorResult(text: string): CallToolResult {
  return { content: [{ type: 'text', text }], isError: true };
}

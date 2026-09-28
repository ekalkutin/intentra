import type { RequestContext } from '@mastra/core/request-context';
import { isValidationError, noopObserve, type Tool } from '@mastra/core/tools';
import type { McpServer } from '@modelcontextprotocol/server';

// oxlint-disable-next-line typescript/no-explicit-any -- tools differ in their schemas
type McpTool = Tool<any, any, any, any>;

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
        const result = await execute(input, {
          observe: noopObserve,
          requestContext,
        });
        if (isValidationError(result)) {
          return {
            content: [{ type: 'text', text: result.message }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result,
        };
      },
    );
  }
}

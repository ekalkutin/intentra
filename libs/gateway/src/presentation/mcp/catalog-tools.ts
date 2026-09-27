import type { McpServer } from '@modelcontextprotocol/server';

import type { ToolApis, ToolDefinition } from '@intentra/agent-surface';

/**
 * The catalog tools offered through MCP. Called once at startup, so a tool that
 * changes data but is marked for MCP stops the server instead of being served:
 * MCP is read-only.
 */
export function selectMcpTools(
  catalog: readonly ToolDefinition[],
): readonly ToolDefinition[] {
  const tools = catalog.filter(tool => tool.exposure.mcp);
  for (const tool of tools) {
    if (!tool.readOnly) {
      throw new Error(
        `Tool ${tool.id} changes data and cannot be offered through MCP`,
      );
    }
  }
  return tools;
}

export function registerMcpTools(
  server: McpServer,
  tools: readonly ToolDefinition[],
  apis: ToolApis,
): void {
  for (const tool of tools) {
    server.registerTool(
      tool.id,
      {
        description: tool.description,
        inputSchema: tool.input,
        outputSchema: tool.output,
      },
      async input => {
        const result = await tool.run(apis, input);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          structuredContent: result,
        };
      },
    );
  }
}

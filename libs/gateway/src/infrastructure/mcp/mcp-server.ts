import type { MCPServerConfig } from '@mastra/core/mcp';
import { MCPServer } from '@mastra/mcp';

/** Токен внедрения: собранный сервер — один на процесс, инструменты в нём не меняются. */
export const MCP_SERVER = Symbol('mcp:server');

/**
 * Продукт, рассказанный внешнему агенту.
 *
 * Описания читает не человек, а модель, и по ним она выбирает инструмент —
 * поэтому они на английском, как и остальной ubiquitous language, и говорят,
 * с чего начать и чем ответ ограничен.
 */
export function createMcpServer(tools: MCPServerConfig['tools']): MCPServer {
  return new MCPServer({
    id: 'intentra',
    name: 'Intentra',
    version: '0.0.0',
    description: 'Read-only access to the projects of an Intentra workspace.',
    instructions: [
      'Every call acts as the account whose access token opened this connection:',
      'the server never sees more than that person sees in the product.',
      'Call list_workspaces first — every other tool needs a workspaceId from it.',
    ].join(' '),
    tools,
  });
}

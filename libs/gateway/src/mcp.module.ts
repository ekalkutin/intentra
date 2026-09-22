import { Module } from '@nestjs/common';

import { WorkspaceClientPort } from './application/ports/index.js';
import {
  createMcpServer,
  MCP_SERVER,
} from './infrastructure/mcp/mcp-server.js';
import { McpController } from './presentation/mcp.controller.js';
import { workspaceTools } from './presentation/workspace/mcp/index.js';

/**
 * Второй транспорт: тот же опубликованный API, рассказанный внешним агентам.
 *
 * Сервер собирается здесь, а не в инструментах и не в контроллере: модуль —
 * то место, где связывают, и только ему положено знать обоих сразу.
 */
@Module({
  controllers: [McpController],
  providers: [
    {
      provide: MCP_SERVER,
      inject: [WorkspaceClientPort],
      useFactory: (workspace: WorkspaceClientPort) =>
        createMcpServer(workspaceTools(workspace)),
    },
  ],
})
export class McpModule {}

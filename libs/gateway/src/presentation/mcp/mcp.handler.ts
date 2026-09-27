import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  toNodeHandler,
  type NodeMcpRequestHandler,
} from '@modelcontextprotocol/node';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { Inject, Injectable } from '@nestjs/common';

import { RESOURCE_CATALOG, TOOL_CATALOG } from '@intentra/agent-surface';
import { IamApi } from '@intentra/contracts/iam';
import { WorkspaceApi } from '@intentra/contracts/workspace';

import {
  registerMcpResources,
  selectMcpResources,
} from './catalog-resources.js';
import { registerMcpTools, selectMcpTools } from './catalog-tools.js';

/**
 * Stateless MCP over Streamable HTTP: the factory builds a fresh McpServer
 * for every request and offers it the catalog tools and resources exposed to
 * MCP, bound to the published APIs from Nest DI.
 */
@Injectable()
export class McpHandler {
  readonly #handle: NodeMcpRequestHandler;

  constructor(
    @Inject(IamApi) iam: IamApi,
    @Inject(WorkspaceApi) workspace: WorkspaceApi,
  ) {
    const tools = selectMcpTools(TOOL_CATALOG);
    const resources = selectMcpResources(RESOURCE_CATALOG);
    const apis = { iam, workspace };

    this.#handle = toNodeHandler(
      createMcpHandler(() => {
        const server = new McpServer({ name: 'intentra', version: '1.0.0' });
        registerMcpTools(server, tools, apis);
        registerMcpResources(server, resources, apis);
        return server;
      }),
    );
  }

  public handle(
    req: IncomingMessage,
    res: ServerResponse,
    body: unknown,
  ): Promise<void> {
    return this.#handle(req, res, body);
  }
}

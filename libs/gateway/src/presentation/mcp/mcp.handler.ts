import type { IncomingMessage, ServerResponse } from 'node:http';

import { RequestContext } from '@mastra/core/request-context';
import {
  toNodeHandler,
  type NodeMcpRequestHandler,
} from '@modelcontextprotocol/node';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { Inject, Injectable } from '@nestjs/common';

import { MCP_TOOLS, type ToolApis } from '@intentra/agent-toolkit';
import { AgentsApi } from '@intentra/contracts/agents';
import { IamApi } from '@intentra/contracts/iam';
import { WorkspaceApi } from '@intentra/contracts/workspace';

import { readCaller } from './mcp-caller.js';
import { registerMcpTools } from './mcp-tools.js';

/**
 * Stateless MCP over Streamable HTTP: a fresh McpServer for every request,
 * offered the MCP tools with the published APIs and the caller, taken from
 * the Personal Access Token, in their request context.
 */
@Injectable()
export class McpHandler {
  readonly #handle: NodeMcpRequestHandler;

  constructor(
    @Inject(IamApi) iam: IamApi,
    @Inject(WorkspaceApi) workspace: WorkspaceApi,
    @Inject(AgentsApi) agents: AgentsApi,
  ) {
    const apis: ToolApis = { iam, workspace, agents };

    this.#handle = toNodeHandler(
      createMcpHandler(({ authInfo }) => {
        const requestContext = new RequestContext();
        requestContext.set('apis', apis);
        requestContext.set('caller', readCaller(authInfo));
        const server = new McpServer({ name: 'intentra', version: '1.0.0' });
        registerMcpTools(server, MCP_TOOLS, requestContext);
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

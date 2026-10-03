import type { IncomingMessage, ServerResponse } from 'node:http';

import { RequestContext } from '@mastra/core/request-context';
import {
  toNodeHandler,
  type NodeMcpRequestHandler,
} from '@modelcontextprotocol/node';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { Inject, Injectable } from '@nestjs/common';

import {
  MCP_TOOLS,
  mcpInstructions,
  type ToolApis,
} from '@intentra/agent-toolkit';
import {
  AgentKindDtoSchema,
  WorkspaceApi,
  type CallerDto,
} from '@intentra/contracts/workspace';

import { readCaller } from './mcp-caller.js';
import { registerMcpTools } from './mcp-tools.js';

/**
 * Stateless MCP over Streamable HTTP: a fresh McpServer for every request,
 * offered the MCP tools with the published sub-APIs, the caller (an agent working
 * for the token's Member) and the token's Workspace in their request context.
 * The instructions name that Workspace, so the agent knows where it works.
 */
@Injectable()
export class McpHandler {
  readonly #handle: NodeMcpRequestHandler;

  constructor(@Inject(WorkspaceApi) workspace: WorkspaceApi) {
    const apis: ToolApis = {
      knowledge: workspace.knowledge,
      projects: workspace.projects,
      access: workspace.access,
    };

    this.#handle = toNodeHandler(
      createMcpHandler(({ authInfo }) => {
        const caller = readCaller(authInfo);
        const requestContext = new RequestContext();
        requestContext.set('apis', apis);
        if (caller) {
          requestContext.set('caller', {
            actor: caller.actor,
            agent: {
              kind: AgentKindDtoSchema.enum.external,
              level: caller.level,
              projectId: null,
            },
          } satisfies CallerDto);
          requestContext.set('workspaceId', caller.workspaceId);
          requestContext.set('workspace', {
            id: caller.workspaceId,
            name: caller.workspaceName,
            slug: caller.workspaceSlug,
          });
        }
        const server = new McpServer(
          { name: 'intentra', version: '1.0.0' },
          caller && {
            instructions: mcpInstructions({
              name: caller.workspaceName,
              slug: caller.workspaceSlug,
            }),
          },
        );
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

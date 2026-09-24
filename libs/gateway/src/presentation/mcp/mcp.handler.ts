import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  toNodeHandler,
  type NodeMcpRequestHandler,
} from '@modelcontextprotocol/node';
import { createMcpHandler, McpServer } from '@modelcontextprotocol/server';
import { Inject, Injectable } from '@nestjs/common';

import { IamApi } from '@intentra/iam-contracts';

import { registerAccountTools } from './tools/accounts.tools.js';

/**
 * Stateless MCP over Streamable HTTP: the factory builds a fresh McpServer
 * for every request, tools get the context ports through Nest DI.
 */
@Injectable()
export class McpHandler {
  readonly #handle: NodeMcpRequestHandler;

  constructor(@Inject(IamApi) iam: IamApi) {
    this.#handle = toNodeHandler(
      createMcpHandler(() => {
        const server = new McpServer({ name: 'intentra', version: '1.0.0' });
        registerAccountTools(server, iam.accounts);
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

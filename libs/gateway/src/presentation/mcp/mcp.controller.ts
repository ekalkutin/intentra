import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  hostHeaderValidation,
  localhostHostValidation,
} from '@modelcontextprotocol/node';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { All, Controller, Inject, Req, Res } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { readBearerToken } from '../rest/auth/index.js';
import { UnauthenticatedException } from '../rest/errors/index.js';

import { toAuthInfo } from './mcp-caller.js';
import { MCP_OPTIONS, type McpOptions } from './mcp-options.js';
import { McpHandler } from './mcp.handler.js';

/** External agents authenticate with a Personal Access Token, typed in by hand or received over OAuth. */
@Controller('mcp')
export class McpController {
  // DNS rebinding protection by the Host header. Origin is not checked:
  // external agents are not browsers and send no Origin.
  readonly #validateHost: (
    req: IncomingMessage,
    res: ServerResponse,
  ) => boolean;
  readonly #challenge: string;

  constructor(
    private readonly mcpHandler: McpHandler,
    @Inject(WorkspaceApi) private readonly workspace: WorkspaceApi,
    @Inject(MCP_OPTIONS) options: McpOptions,
  ) {
    this.#validateHost = options.allowedHosts
      ? hostHeaderValidation([...options.allowedHosts])
      : localhostHostValidation();
    // RFC 9728: tells an OAuth client where to start; plain Bearer while OAuth is off.
    this.#challenge = options.resourceMetadataUrl
      ? `Bearer resource_metadata="${options.resourceMetadataUrl}"`
      : 'Bearer';
  }

  @All()
  public async handle(
    @Req() req: IncomingMessage & { body?: unknown; auth?: AuthInfo },
    @Res() res: ServerResponse,
  ): Promise<void> {
    if (!this.#validateHost(req, res)) return;

    const secret = readBearerToken(req.headers);
    if (!secret) {
      res.setHeader('WWW-Authenticate', this.#challenge);
      throw new UnauthenticatedException('Personal access token is missing');
    }
    const caller = await this.workspace.personalAccessTokens
      .authenticate(secret)
      .catch((error: unknown) => {
        res.setHeader('WWW-Authenticate', this.#challenge);
        throw error;
      });
    req.auth = toAuthInfo(secret, caller);

    // Nest has already parsed the JSON body, so it is passed on as is.
    await this.mcpHandler.handle(req, res, req.body);
  }
}

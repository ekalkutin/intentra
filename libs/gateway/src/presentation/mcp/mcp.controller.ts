import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  hostHeaderValidation,
  localhostHostValidation,
} from '@modelcontextprotocol/node';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { All, Controller, Inject, Param, Req, Res } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { readBearerToken } from '../rest/auth/index.js';
import { UnauthenticatedException } from '../rest/errors/index.js';

import { toAuthInfo } from './mcp-caller.js';
import { MCP_OPTIONS, type McpOptions } from './mcp-options.js';
import { McpHandler } from './mcp.handler.js';

/**
 * External agents authenticate with a Personal Access Token, typed in by hand
 * or received over OAuth. `/api/mcp` takes a token of any Workspace;
 * `/api/mcp/<slug>` only one of that Workspace, so a client that keeps tokens
 * by address cannot take one Workspace's token to another.
 */
@Controller('mcp')
export class McpController {
  // DNS rebinding protection by the Host header. Origin is not checked:
  // external agents are not browsers and send no Origin.
  readonly #validateHost: (
    req: IncomingMessage,
    res: ServerResponse,
  ) => boolean;
  readonly #resourceMetadataUrl: string | undefined;

  constructor(
    private readonly mcpHandler: McpHandler,
    @Inject(WorkspaceApi) private readonly workspace: WorkspaceApi,
    @Inject(MCP_OPTIONS) options: McpOptions,
  ) {
    this.#validateHost = options.allowedHosts
      ? hostHeaderValidation([...options.allowedHosts])
      : localhostHostValidation();
    this.#resourceMetadataUrl = options.resourceMetadataUrl;
  }

  @All(['', ':workspaceSlug'])
  public async handle(
    @Req() req: IncomingMessage & { body?: unknown; auth?: AuthInfo },
    @Res() res: ServerResponse,
    @Param('workspaceSlug') workspaceSlug?: string,
  ): Promise<void> {
    if (!this.#validateHost(req, res)) return;

    const challenge = this.#challenge(workspaceSlug);
    const secret = readBearerToken(req.headers);
    if (!secret) {
      res.setHeader('WWW-Authenticate', challenge);
      throw new UnauthenticatedException('Personal access token is missing');
    }
    const caller = await this.workspace.personalAccessTokens
      .authenticate(secret)
      .catch((error: unknown) => {
        res.setHeader('WWW-Authenticate', challenge);
        throw error;
      });
    // An unknown slug ends here too: no token is for it.
    if (workspaceSlug !== undefined && workspaceSlug !== caller.workspaceSlug) {
      res.setHeader('WWW-Authenticate', challenge);
      throw new UnauthenticatedException(
        'Personal access token is for another Workspace',
      );
    }
    req.auth = toAuthInfo(secret, caller);

    // Nest has already parsed the JSON body, so it is passed on as is.
    await this.mcpHandler.handle(req, res, req.body);
  }

  /**
   * RFC 9728: tells an OAuth client where to start, at the metadata of the
   * address it called; plain Bearer while OAuth is off.
   */
  #challenge(workspaceSlug: string | undefined): string {
    if (!this.#resourceMetadataUrl) {
      return 'Bearer';
    }
    const url =
      workspaceSlug === undefined
        ? this.#resourceMetadataUrl
        : `${this.#resourceMetadataUrl}/${encodeURIComponent(workspaceSlug)}`;

    return `Bearer resource_metadata="${url}"`;
  }
}

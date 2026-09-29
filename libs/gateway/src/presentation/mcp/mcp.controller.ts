import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  localhostHostValidation,
  localhostOriginValidation,
} from '@modelcontextprotocol/node';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { All, Controller, Inject, Req, Res } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { readBearerToken } from '../rest/auth/index.js';
import { UnauthenticatedException } from '../rest/errors/index.js';

import { toAuthInfo } from './mcp-caller.js';
import { McpHandler } from './mcp.handler.js';

// DNS rebinding protection: localhost only. Configure allowed hosts before
// exposing the gateway publicly (hostHeaderValidation / originValidation).
const validateHost = localhostHostValidation();
const validateOrigin = localhostOriginValidation();

/** External agents authenticate with a Personal Access Token. */
@Controller('mcp')
export class McpController {
  constructor(
    private readonly mcpHandler: McpHandler,
    @Inject(WorkspaceApi) private readonly workspace: WorkspaceApi,
  ) {}

  @All()
  public async handle(
    @Req() req: IncomingMessage & { body?: unknown; auth?: AuthInfo },
    @Res() res: ServerResponse,
  ): Promise<void> {
    if (!validateHost(req, res) || !validateOrigin(req, res)) return;

    const secret = readBearerToken(req.headers);
    if (!secret) {
      throw new UnauthenticatedException('Personal access token is missing');
    }
    const caller =
      await this.workspace.personalAccessTokens.authenticate(secret);
    req.auth = toAuthInfo(secret, caller);

    // Nest has already parsed the JSON body, so it is passed on as is.
    await this.mcpHandler.handle(req, res, req.body);
  }
}

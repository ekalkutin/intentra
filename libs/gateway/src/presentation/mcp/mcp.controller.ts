import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  localhostHostValidation,
  localhostOriginValidation,
} from '@modelcontextprotocol/node';
import type { AuthInfo } from '@modelcontextprotocol/server';
import { All, Controller, Req, Res } from '@nestjs/common';

import {
  Authentication,
  AuthMethod,
  bearerToken,
  CurrentAccount,
  type AuthenticatedAccount,
} from '../auth/index.js';

import { McpHandler } from './mcp.handler.js';

// DNS rebinding protection: localhost only. Configure allowed hosts before
// exposing the gateway publicly (hostHeaderValidation / originValidation).
const validateHost = localhostHostValidation();
const validateOrigin = localhostOriginValidation();

/** Agents authenticate by a personal access token, never by a JWT. */
@Authentication(AuthMethod.PersonalAccessToken)
@Controller('mcp')
export class McpController {
  constructor(private readonly mcpHandler: McpHandler) {}

  @All()
  public async handle(
    @CurrentAccount() account: AuthenticatedAccount,
    @Req() req: IncomingMessage & { body?: unknown; auth?: AuthInfo },
    @Res() res: ServerResponse,
  ): Promise<void> {
    if (!validateHost(req, res) || !validateOrigin(req, res)) return;

    // The MCP SDK hands `req.auth` to the server factory as `authInfo`.
    req.auth = {
      token: bearerToken(req) ?? '',
      clientId: account.id,
      scopes: [],
    };

    // Nest has already parsed the JSON body, so it is passed on as is.
    await this.mcpHandler.handle(req, res, req.body);
  }
}

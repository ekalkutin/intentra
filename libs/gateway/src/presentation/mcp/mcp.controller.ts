import type { IncomingMessage, ServerResponse } from 'node:http';

import {
  localhostHostValidation,
  localhostOriginValidation,
} from '@modelcontextprotocol/node';
import { All, Controller, Req, Res } from '@nestjs/common';

import { McpHandler } from './mcp.handler.js';

// DNS rebinding protection: localhost only. Configure allowed hosts before
// exposing the gateway publicly (hostHeaderValidation / originValidation).
const validateHost = localhostHostValidation();
const validateOrigin = localhostOriginValidation();

@Controller('mcp')
export class McpController {
  constructor(private readonly mcpHandler: McpHandler) {}

  @All()
  public async handle(
    @Req() req: IncomingMessage & { body?: unknown },
    @Res() res: ServerResponse,
  ): Promise<void> {
    if (!validateHost(req, res) || !validateOrigin(req, res)) return;

    // Nest has already parsed the JSON body, so it is passed on as is.
    await this.mcpHandler.handle(req, res, req.body);
  }
}

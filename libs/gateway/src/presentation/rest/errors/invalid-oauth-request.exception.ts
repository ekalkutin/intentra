import { HttpStatus } from '@nestjs/common';

import { GatewayException } from './gateway.exception.js';

/** An OAuth client asked for something it may not: unknown client, unregistered redirect URI. */
export class InvalidOAuthRequestException extends GatewayException<'INVALID_OAUTH_REQUEST'> {
  constructor(message: string) {
    super(message, 'INVALID_OAUTH_REQUEST', HttpStatus.BAD_REQUEST);
  }
}

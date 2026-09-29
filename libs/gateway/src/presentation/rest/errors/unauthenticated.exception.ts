import { HttpStatus } from '@nestjs/common';

import { GatewayException } from './gateway.exception.js';

export class UnauthenticatedException extends GatewayException<'UNAUTHENTICATED'> {
  constructor(message: string) {
    super(message, 'UNAUTHENTICATED', HttpStatus.UNAUTHORIZED);
  }
}

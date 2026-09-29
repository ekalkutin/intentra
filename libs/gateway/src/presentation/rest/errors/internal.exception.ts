import { HttpStatus } from '@nestjs/common';

import { GatewayException } from './gateway.exception.js';

export class InternalException extends GatewayException<'INTERNAL'> {
  constructor() {
    super(
      'Internal server error',
      'INTERNAL',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

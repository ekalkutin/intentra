import { HttpStatus } from '@nestjs/common';

import { GatewayException } from './gateway.exception.js';

export class ValidationFailedException extends GatewayException<'VALIDATION_FAILED'> {
  constructor(message: string) {
    super(message, 'VALIDATION_FAILED', HttpStatus.BAD_REQUEST);
  }
}

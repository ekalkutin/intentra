import { HttpStatus } from '@nestjs/common';

import { GatewayException } from './gateway.exception.js';

export class NotPlatformAdminException extends GatewayException<'NOT_PLATFORM_ADMIN'> {
  constructor() {
    super(
      'Only a platform admin can do this',
      'NOT_PLATFORM_ADMIN',
      HttpStatus.FORBIDDEN,
    );
  }
}

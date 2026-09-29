import type { HttpStatus } from '@nestjs/common';

import type { WireError } from './wire-error.js';

/** Errors the gateway reports itself, shaped like a context exception. */
export abstract class GatewayException<Code extends string = string>
  extends Error
  implements WireError
{
  public readonly retryable: boolean = false;

  protected constructor(
    message: string,
    public readonly code: Code,
    public readonly status: HttpStatus,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

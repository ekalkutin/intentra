import { HttpStatus } from '../http-status.js';

import { ApplicationException } from './application.exception.js';

export class UnauthorizedException<
  Code extends string = string,
> extends ApplicationException<Code> {
  protected static override readonly defaultStatus: number =
    HttpStatus.UNAUTHORIZED;

  constructor(message: string, code: Code) {
    super(message, code);
  }
}

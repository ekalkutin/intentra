import { HttpStatus } from '../http-status.js';

import { ApplicationException } from './application.exception.js';

export class ConflictException<
  Code extends string = string,
> extends ApplicationException<Code> {
  protected static override readonly defaultStatus: number =
    HttpStatus.CONFLICT;

  constructor(message: string, code: Code) {
    super(message, code);
  }
}

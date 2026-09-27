import { BaseException } from '../base.exception.js';
import { HttpStatus } from '../http-status.js';

/** A use case that cannot go on in the current state. */
export abstract class ApplicationException<
  Code extends string = string,
> extends BaseException<Code> {
  protected static override readonly defaultStatus: number =
    HttpStatus.PRECONDITION_FAILED;
}

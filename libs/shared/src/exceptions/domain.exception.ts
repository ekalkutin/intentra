import { BaseException } from './base.exception.js';
import { HttpStatus } from './http-status.js';

/** A broken domain rule or an invalid value object. */
export abstract class DomainException<
  Code extends string = string,
> extends BaseException<Code> {
  protected static override readonly defaultStatus: number =
    HttpStatus.BAD_REQUEST;
}

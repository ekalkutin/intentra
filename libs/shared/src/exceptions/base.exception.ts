import { HttpStatus } from './http-status.js';

/**
 * Root of every expected failure. It carries what the gateway tells the
 * client: a message for people, a stable `code` to branch on and the `status`
 * behind it. A subclass picks its status by overriding `defaultStatus`.
 */
export abstract class BaseException<
  Code extends string = string,
> extends Error {
  public readonly code: Code;
  public readonly status: number;
  public readonly retryable: boolean;

  protected static readonly defaultStatus: number =
    HttpStatus.INTERNAL_SERVER_ERROR;
  protected static readonly defaultRetryable: boolean = false;

  protected constructor(message: string, code: Code) {
    super(message);

    const type = new.target as unknown as typeof BaseException;
    this.name = new.target.name;
    this.code = code;
    this.status = type.defaultStatus;
    this.retryable = type.defaultRetryable;
  }
}

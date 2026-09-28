export abstract class BaseException<
  Code extends string = string,
> extends Error {
  public readonly code: Code;
  public readonly status: number;
  public readonly retryable: boolean;

  protected static readonly defaultStatus: number = 500;

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

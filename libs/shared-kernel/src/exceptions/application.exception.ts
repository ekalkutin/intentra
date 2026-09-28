import { BaseException } from './base.exception.js';

export abstract class ApplicationException<
  Code extends string = string,
> extends BaseException<Code> {
  protected static override readonly defaultStatus: number = 412;
}

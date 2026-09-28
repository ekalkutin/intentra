import { BaseException } from './base.exception.js';

export abstract class DomainException<
  Code extends string = string,
> extends BaseException<Code> {
  protected static override readonly defaultStatus: number = 400;
}

import { ApplicationException } from './application.exception.js';

export abstract class ConflictException<
  Code extends string = string,
> extends ApplicationException<Code> {
  protected static override readonly defaultStatus: number = 409;
}

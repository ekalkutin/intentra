import { ApplicationException } from './application.exception.js';

export abstract class ForbiddenException<
  Code extends string = string,
> extends ApplicationException<Code> {
  protected static override readonly defaultStatus: number = 403;
}

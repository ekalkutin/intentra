import { ApplicationException } from './application.exception.js';

export abstract class UnavailableException<
  Code extends string = string,
> extends ApplicationException<Code> {
  protected static override readonly defaultStatus: number = 503;
}

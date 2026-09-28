import {
  Catch,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';

import { describeError, internalError } from './wire-error.js';

type JsonResponse = {
  status(code: number): { json(body: unknown): void };
};

/** A filter, not an interceptor: it must also see what guards throw. */
@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  readonly #logger = new Logger(ExceptionsFilter.name);

  public catch(error: unknown, host: ArgumentsHost): void {
    const wire = describeError(error);
    if (!wire) {
      this.#logger.error(error);
    }
    const body = wire ?? internalError();

    host
      .switchToHttp()
      .getResponse<JsonResponse>()
      .status(body.status)
      .json(body);
  }
}

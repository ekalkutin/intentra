import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Inject,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

import { describeError, INTERNAL_ERROR, type WireError } from './wire-error.js';

/**
 * Global, so it also sees what guards throw, which interceptors never do.
 * Every error leaves as a `WireError`; an unknown one is logged here, the last
 * place it is seen whole, and goes out as `INTERNAL` without details.
 */
@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  readonly #logger = new Logger(ExceptionsFilter.name);

  constructor(
    @Inject(HttpAdapterHost)
    private readonly adapterHost: HttpAdapterHost,
  ) {}

  public catch(exception: unknown, host: ArgumentsHost): GraphQLError | void {
    const wire = describeError(exception) ?? this.#internal(exception);

    if (host.getType<GqlContextType>() === 'graphql') {
      return new GraphQLError(wire.message, {
        extensions: {
          code: wire.code,
          status: wire.status,
          retryable: wire.retryable,
        },
      });
    }

    const { httpAdapter } = this.adapterHost;
    const response: unknown = host.switchToHttp().getResponse();
    // A streamed response (MCP) has sent its status already.
    if (httpAdapter.isHeadersSent(response)) {
      httpAdapter.end(response);
      return;
    }
    httpAdapter.reply(response, wire, wire.status);
  }

  #internal(exception: unknown): WireError {
    this.#logger.error(
      exception instanceof Error
        ? (exception.stack ?? exception.message)
        : exception,
    );
    return INTERNAL_ERROR;
  }
}

import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { catchError, Observable, throwError } from 'rxjs';

import {
  isExpectedException,
  type ExpectedException,
} from './expected-exception.js';

/**
 * Turns an expected failure of a context into a response: its status and
 * stable code go to the client, for REST and GraphQL alike. Anything else is
 * left to Nest, so an unexpected error stays a 500 without details.
 */
@Injectable()
export class ExceptionsInterceptor implements NestInterceptor {
  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const graphql = context.getType<GqlContextType>() === 'graphql';

    return next
      .handle()
      .pipe(
        catchError(error =>
          throwError(() =>
            isExpectedException(error)
              ? graphql
                ? toGraphQLError(error)
                : toHttpException(error)
              : error,
          ),
        ),
      );
  }
}

function toHttpException(exception: ExpectedException): HttpException {
  return new HttpException(
    {
      statusCode: exception.status,
      code: exception.code,
      message: exception.message,
      retryable: exception.retryable,
    },
    exception.status,
  );
}

function toGraphQLError(exception: ExpectedException): GraphQLError {
  return new GraphQLError(exception.message, {
    extensions: {
      code: exception.code,
      status: exception.status,
      retryable: exception.retryable,
    },
  });
}

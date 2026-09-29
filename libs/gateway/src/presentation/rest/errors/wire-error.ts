import { HttpException, HttpStatus } from '@nestjs/common';

import type { GatewayException } from './gateway.exception.js';
import { InternalException } from './internal.exception.js';
import { UnauthenticatedException } from './unauthenticated.exception.js';
import { ValidationFailedException } from './validation-failed.exception.js';

/** The one error shape every REST response uses. */
export type WireError = {
  readonly message: string;
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
};

/** Errors Nest raises itself, e.g. the validation pipe or a guard. */
const HTTP_EXCEPTIONS: Partial<
  Record<number, (message: string) => GatewayException>
> = {
  [HttpStatus.BAD_REQUEST]: message => new ValidationFailedException(message),
  [HttpStatus.UNAUTHORIZED]: message => new UnauthenticatedException(message),
};

/**
 * Context exceptions are recognised by shape, not by class: the gateway does not
 * import the shared kernel. Returns `null` for an error nobody expected.
 */
export function describeError(error: unknown): WireError | null {
  if (error instanceof HttpException) {
    const status = error.getStatus();
    const known = HTTP_EXCEPTIONS[status]?.(error.message);
    if (known) {
      return toWire(known);
    }

    return {
      message: error.message,
      code: HttpStatus[status] ?? new InternalException().code,
      status,
      retryable: false,
    };
  }
  if (isWireShaped(error)) {
    return toWire(error);
  }

  return null;
}

export function internalError(): WireError {
  return toWire(new InternalException());
}

function toWire(error: Error & WireError): WireError {
  return {
    message: error.message,
    code: error.code,
    status: error.status,
    retryable: error.retryable,
  };
}

function isWireShaped(error: unknown): error is Error & WireError {
  return (
    error instanceof Error &&
    typeof (error as Partial<WireError>).code === 'string' &&
    typeof (error as Partial<WireError>).status === 'number' &&
    typeof (error as Partial<WireError>).retryable === 'boolean'
  );
}

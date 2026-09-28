import { HttpException, HttpStatus } from '@nestjs/common';

/** The one error shape every REST response uses. */
export type WireError = {
  readonly message: string;
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
};

/** Codes for errors Nest raises itself, e.g. the validation pipe or a guard. */
const HTTP_CODES: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'VALIDATION_FAILED',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
};

const INTERNAL: WireError = {
  message: 'Internal server error',
  code: 'INTERNAL',
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  retryable: false,
};

/**
 * Context exceptions are recognised by shape, not by class: the gateway does not
 * import the shared kernel. Returns `null` for an error nobody expected.
 */
export function describeError(error: unknown): WireError | null {
  if (error instanceof HttpException) {
    const status = error.getStatus();

    return {
      message: error.message,
      code: HTTP_CODES[status] ?? HttpStatus[status] ?? INTERNAL.code,
      status,
      retryable: false,
    };
  }
  if (isContextException(error)) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      retryable: error.retryable,
    };
  }

  return null;
}

export function internalError(): WireError {
  return INTERNAL;
}

function isContextException(error: unknown): error is Error & WireError {
  return (
    error instanceof Error &&
    typeof (error as Partial<WireError>).code === 'string' &&
    typeof (error as Partial<WireError>).status === 'number' &&
    typeof (error as Partial<WireError>).retryable === 'boolean'
  );
}

import { HttpException, HttpStatus } from '@nestjs/common';

/** The one shape of an error on the wire, for REST and GraphQL alike. */
export type WireError = {
  readonly message: string;
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
};

export const INTERNAL_ERROR: WireError = {
  message: 'Internal server error',
  code: 'INTERNAL',
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  retryable: false,
};

const STATUS_CODES: Readonly<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
  [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.CONFLICT]: 'CONFLICT',
  [HttpStatus.PRECONDITION_FAILED]: 'PRECONDITION_FAILED',
  [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
};

/**
 * `BaseException` of the shared kernel, told by its shape: the gateway may not
 * import the kernel, and no class survives a trip over the wire anyway.
 */
function isBaseException(error: unknown): error is Error & WireError {
  if (!(error instanceof Error)) {
    return false;
  }
  const { code, status, retryable } = error as Partial<WireError>;
  return (
    typeof code === 'string' &&
    typeof status === 'number' &&
    typeof retryable === 'boolean'
  );
}

/** Guards, pipes and Nest itself throw these. */
function fromHttpException(error: HttpException): WireError {
  const status = error.getStatus();
  const response = error.getResponse();
  const body =
    typeof response === 'object' ? (response as { message?: unknown }) : {};

  // The validation pipe puts one message per failed field into an array.
  if (Array.isArray(body.message)) {
    return {
      message: body.message.join('; '),
      code: 'VALIDATION_FAILED',
      status,
      retryable: false,
    };
  }

  return {
    message: typeof body.message === 'string' ? body.message : error.message,
    code: STATUS_CODES[status] ?? `HTTP_${status}`,
    status,
    retryable: status === HttpStatus.TOO_MANY_REQUESTS,
  };
}

/** `null`: nothing can be told to the client, so it is an internal error. */
export function describeError(error: unknown): WireError | null {
  if (isBaseException(error)) {
    const { message, code, status, retryable } = error;
    return { message, code, status, retryable };
  }
  if (error instanceof HttpException) {
    return fromHttpException(error);
  }
  return null;
}
